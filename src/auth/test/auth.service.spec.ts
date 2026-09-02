import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { Role } from '../../generated/prisma/client.js';

import { AuthService } from '../AuthService.js';
import { UserAlreadyExistsException } from '../exceptions/UserAlreadyExistsException.js';
import { UnauthorizedException } from '@nestjs/common';
import {
    createMockAuthRepository,
    createMockJwtService,
    type MockAuthRepository,
    type MockJwtService,
} from './helpers/auth.mocks.js';
import {
    buildRegisterInput,
    buildUser,
} from './helpers/auth.fixtures.js';
import type { AuthenticatedUser } from '../dto/AuthenticatedUser.js';

// ─── Mock bcrypt module ───────────────────────────────────────────────────────

vi.mock('bcrypt');

// ─────────────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
    let service: AuthService;
    let authRepository: MockAuthRepository;
    let jwtService: MockJwtService;
    let hashSync: MockInstance<(password: string, saltOrRounds: number) => string>;
    let compareSync: MockInstance<(data: string, encrypted: string) => boolean>;

    beforeEach(async () => {
        vi.clearAllMocks();

        const bcrypt = await import('bcrypt');
        hashSync = vi.mocked(bcrypt.default.hashSync);
        compareSync = vi.mocked(bcrypt.default.compareSync);
        hashSync.mockReturnValue('$2b$10$hashed');

        authRepository = createMockAuthRepository();
        jwtService = createMockJwtService();
        service = new AuthService(
            authRepository,
            jwtService as unknown as import('@nestjs/jwt').JwtService,
        );
    });


    it('should be defined', () => {
        expect(service).toBeDefined();
    });


    // ─── register ────────────────────────────────────────────────────────────

    describe('register', () => {
        it('should create a new user and return the public profile (without password)', async () => {
            const input = buildRegisterInput();
            const storedUser = buildUser({ email: input.email, name: input.name });

            authRepository.findByEmail.mockResolvedValue(null);
            authRepository.create.mockResolvedValue(storedUser);

            const result = await service.register(input);

            expect(result).toEqual({
                userPublicId: storedUser.userPublicId,
                name: storedUser.name,
                email: storedUser.email,
                role: storedUser.role,
            });
            expect(result).not.toHaveProperty('password');
            expect(result).not.toHaveProperty('userId');
        });

        it('should hash the password before persisting it', async () => {
            const input = buildRegisterInput({ password: 'plainPassword' });
            const storedUser = buildUser();

            authRepository.findByEmail.mockResolvedValue(null);
            authRepository.create.mockResolvedValue(storedUser);

            await service.register(input);

            expect(hashSync).toHaveBeenCalledWith('plainPassword', 10);
            expect(authRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ password: '$2b$10$hashed' }),
            );
        });

        it('should check email uniqueness before creating the user', async () => {
            authRepository.findByEmail.mockResolvedValue(null);
            authRepository.create.mockResolvedValue(buildUser());

            await service.register(buildRegisterInput());

            expect(authRepository.findByEmail).toHaveBeenCalledTimes(1);
            expect(authRepository.findByEmail).toHaveBeenCalledWith(
                buildRegisterInput().email,
            );
        });

        it('should throw UserAlreadyExistsException when the email is already taken', async () => {
            const input = buildRegisterInput();
            authRepository.findByEmail.mockResolvedValue(buildUser());

            await expect(service.register(input)).rejects.toThrow(
                UserAlreadyExistsException,
            );
        });

        it('should include the email in the UserAlreadyExistsException message', async () => {
            const input = buildRegisterInput({ email: 'taken@example.com' });
            authRepository.findByEmail.mockResolvedValue(buildUser());

            await expect(service.register(input)).rejects.toThrow(
                /taken@example\.com/,
            );
        });

        it('should NOT call authRepository.create when the email is already taken', async () => {
            authRepository.findByEmail.mockResolvedValue(buildUser());

            await expect(
                service.register(buildRegisterInput()),
            ).rejects.toThrow(UserAlreadyExistsException);

            expect(authRepository.create).not.toHaveBeenCalled();
        });
    });


    // ─── validateUser ────────────────────────────────────────────────────────

    describe('validateUser', () => {
        it('should return an AuthenticatedUser when credentials are valid', async () => {
            const storedUser = buildUser();

            authRepository.findByEmail.mockResolvedValue(storedUser);
            compareSync.mockReturnValue(true);

            const result = await service.validateUser(storedUser.email, 'password123');

            expect(result).toEqual({
                userPublicId: storedUser.userPublicId,
                name: storedUser.name,
                email: storedUser.email,
                role: storedUser.role,
            });
        });

        it('should return null when the user does not exist', async () => {
            authRepository.findByEmail.mockResolvedValue(null);

            const result = await service.validateUser('unknown@example.com', 'password123');

            expect(result).toBeNull();
        });

        it('should return null when the password is incorrect', async () => {
            authRepository.findByEmail.mockResolvedValue(buildUser());
            compareSync.mockReturnValue(false);

            const result = await service.validateUser('john@example.com', 'wrongPassword');

            expect(result).toBeNull();
        });

        it('should compare plain password against stored hash', async () => {
            const storedUser = buildUser();
            authRepository.findByEmail.mockResolvedValue(storedUser);
            compareSync.mockReturnValue(true);

            await service.validateUser(storedUser.email, 'myPlainPassword');

            expect(compareSync).toHaveBeenCalledWith('myPlainPassword', storedUser.password);
        });

        it('should NOT expose the password in the returned AuthenticatedUser', async () => {
            const storedUser = buildUser();
            authRepository.findByEmail.mockResolvedValue(storedUser);
            compareSync.mockReturnValue(true);

            const result = await service.validateUser(storedUser.email, 'password123');

            expect(result).not.toHaveProperty('password');
        });
    });


    // ─── login ────────────────────────────────────────────────────────────────
    // login() recibe un AuthenticatedUser ya validado (puesto en req.user
    // por LocalStrategy) y emite el JWT.

    describe('login', () => {
        function buildAuthenticatedUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
            const user = buildUser();
            return {
                userPublicId: user.userPublicId,
                name: user.name,
                email: user.email,
                role: user.role,
                ...overrides,
            };
        }

        it('should return an accessToken and the public user profile', async () => {
            const authenticatedUser = buildAuthenticatedUser();

            const result = await service.login(authenticatedUser);

            expect(result).toMatchObject({
                accessToken: 'mocked.jwt.token',
                user: {
                    userId: authenticatedUser.userPublicId,
                    name: authenticatedUser.name,
                    email: authenticatedUser.email,
                    role: authenticatedUser.role,
                },
            });
        });

        it('should sign the JWT with sub = userPublicId and role', async () => {
            const authenticatedUser = buildAuthenticatedUser({ role: Role.ADMIN });

            await service.login(authenticatedUser);

            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: authenticatedUser.userPublicId,
                role: Role.ADMIN,
            });
        });

        it('should NOT expose the password in the returned user object', async () => {
            const result = await service.login(buildAuthenticatedUser());

            expect(result.user).not.toHaveProperty('password');
        });
    });


    // ─── getMe ────────────────────────────────────────────────────────────────

    describe('getMe', () => {
        it('should return the public profile of the user when found', async () => {
            const storedUser = buildUser();

            authRepository.findById.mockResolvedValue(storedUser);

            const result = await service.getMe(storedUser.userPublicId);

            expect(result).toEqual({
                userId: storedUser.userPublicId,
                name: storedUser.name,
                email: storedUser.email,
                role: storedUser.role,
            });
        });

        it('should NOT expose the password in the returned profile', async () => {
            const storedUser = buildUser();

            authRepository.findById.mockResolvedValue(storedUser);

            const result = await service.getMe(storedUser.userPublicId);

            expect(result).not.toHaveProperty('password');
        });

        it('should throw UnauthorizedException when the user is not found', async () => {
            authRepository.findById.mockResolvedValue(null);

            await expect(service.getMe('non-existent-id')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should include "Credenciales inválidas" in the error message', async () => {
            authRepository.findById.mockResolvedValue(null);

            await expect(service.getMe('any-id')).rejects.toThrow(
                /Credenciales inválidas/,
            );
        });

        it('should look up the user by the provided userPublicId', async () => {
            const publicId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
            authRepository.findById.mockResolvedValue(buildUser({ userPublicId: publicId }));

            await service.getMe(publicId);

            expect(authRepository.findById).toHaveBeenCalledWith(publicId);
        });
    });
});