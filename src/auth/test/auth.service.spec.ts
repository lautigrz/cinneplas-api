import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { Role } from '../../generated/prisma/client.js';

import { AuthService } from '../AuthService.js';
import { UserAlreadyExistsException } from '../exceptions/UserAlreadyExistsException.js';
import { InvalidCredentialsException } from '../exceptions/InvalidCredentialsException.js';
import {
    createMockAuthRepository,
    createMockJwtService,
    type MockAuthRepository,
    type MockJwtService,
} from './helpers/auth.mocks.js';
import {
    buildLoginInput,
    buildRegisterInput,
    buildUser,
} from './helpers/auth.fixtures.js';

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



    describe('login', () => {
        it('should return an access token and the public user profile on valid credentials', async () => {
            const input = buildLoginInput();
            const storedUser = buildUser({ email: input.email });

            authRepository.findByEmail.mockResolvedValue(storedUser);
            compareSync.mockReturnValue(true);

            const result = await service.login(input);

            expect(result).toMatchObject({
                accessToken: 'mocked.jwt.token',
                user: {
                    userId: storedUser.userPublicId,
                    name: storedUser.name,
                    email: storedUser.email,
                    role: storedUser.role,
                },
            });
        });

        it('should sign the JWT with the correct payload (sub + role)', async () => {
            const storedUser = buildUser({ role: Role.Admin });

            authRepository.findByEmail.mockResolvedValue(storedUser);
            compareSync.mockReturnValue(true);

            await service.login(buildLoginInput());

            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: storedUser.userPublicId,
                role: Role.Admin,
            });
        });

        it('should compare the incoming password against the stored hash', async () => {
            const input = buildLoginInput({ password: 'myPassword' });
            const storedUser = buildUser();

            authRepository.findByEmail.mockResolvedValue(storedUser);
            compareSync.mockReturnValue(true);

            await service.login(input);

            expect(compareSync).toHaveBeenCalledWith(
                'myPassword',
                storedUser.password,
            );
        });

        it('should throw InvalidCredentialsException when the user does not exist', async () => {
            authRepository.findByEmail.mockResolvedValue(null);

            await expect(service.login(buildLoginInput())).rejects.toThrow(
                InvalidCredentialsException,
            );
        });

        it('should throw InvalidCredentialsException when the password is wrong', async () => {
            authRepository.findByEmail.mockResolvedValue(buildUser());
            compareSync.mockReturnValue(false);

            await expect(service.login(buildLoginInput())).rejects.toThrow(
                InvalidCredentialsException,
            );
        });

        it('should NOT call jwtService.sign when credentials are invalid', async () => {
            authRepository.findByEmail.mockResolvedValue(null);

            await expect(service.login(buildLoginInput())).rejects.toThrow(
                InvalidCredentialsException,
            );

            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('should NOT expose the password in the returned user object', async () => {
            authRepository.findByEmail.mockResolvedValue(buildUser());
            compareSync.mockReturnValue(true);

            const result = await service.login(buildLoginInput());

            expect(result.user).not.toHaveProperty('password');
        });
    });



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
                /non-existent-id/,
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