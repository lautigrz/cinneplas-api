import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockedFunction } from 'vitest';

import { AuthController } from '../AuthController.js';
import type { IAuthService } from '../interfaces/auth.service.interface.js';
import type { AuthenticatedUser } from '../contracts/authenticated-user.js';
import {
    buildRegisterInput,
    buildUser,
} from './helpers/auth.fixtures.js';

// ─── Mock IAuthService ────────────────────────────────────────────────────────

type MockAuthService = {
    [K in keyof IAuthService]: MockedFunction<IAuthService[K]>;
};

function createMockAuthService(): MockAuthService {
    return {
        register: vi.fn(),
        validateUser: vi.fn(),
        login: vi.fn(),
        getMe: vi.fn(),
    };
}

function buildAuthenticatedUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
    return {
        userPublicId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'USER',
        ...overrides,
    };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('AuthController', () => {
    let controller: AuthController;
    let authService: MockAuthService;

    beforeEach(() => {
        vi.clearAllMocks();
        authService = createMockAuthService();
        controller = new AuthController(authService as unknown as IAuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });


    // ─── register ────────────────────────────────────────────────────────────

    describe('register', () => {
        it('should delegate to authService.register with the provided body', async () => {
            const input = buildRegisterInput();
            const expectedResponse = {
                userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                name: input.name,
                email: input.email,
                role: 'USER',
            };

            authService.register.mockResolvedValue(expectedResponse);

            const result = await controller.register(input);

            expect(authService.register).toHaveBeenCalledOnce();
            expect(authService.register).toHaveBeenCalledWith(input);
            expect(result).toEqual(expectedResponse);
        });

        it('should return whatever the service resolves with', async () => {
            const serviceResponse = { userId: 'abc-123', name: 'Test', email: 'test@test.com', role: 'USER' };
            authService.register.mockResolvedValue(serviceResponse);

            const result = await controller.register(buildRegisterInput());

            expect(result).toBe(serviceResponse);
        });

        it('should propagate exceptions thrown by authService.register', async () => {
            authService.register.mockRejectedValue(new Error('UserAlreadyExists'));

            await expect(controller.register(buildRegisterInput())).rejects.toThrow('UserAlreadyExists');
        });
    });


    // ─── login ───────────────────────────────────────────────────────────────
    // El controller login() recibe req.user (AuthenticatedUser puesto por
    // LocalAuthGuard/LocalStrategy) y lo delega al servicio para emitir el JWT.

    describe('login', () => {
        it('should delegate to authService.login with req.user', async () => {
            const authenticatedUser = buildAuthenticatedUser();
            const expectedResponse = {
                accessToken: 'mocked.jwt.token',
                user: { userId: authenticatedUser.userPublicId, name: authenticatedUser.name, email: authenticatedUser.email, role: authenticatedUser.role },
            };

            authService.login.mockResolvedValue(expectedResponse);

            const fakeReq = { user: authenticatedUser } as any;
            const result = await controller.login(fakeReq);

            expect(authService.login).toHaveBeenCalledOnce();
            expect(authService.login).toHaveBeenCalledWith(authenticatedUser);
            expect(result).toEqual(expectedResponse);
        });

        it('should return whatever the service resolves with', async () => {
            const serviceResponse = { accessToken: 'token123', user: { userId: 'uuid-1', name: 'John Doe', email: 'user@test.com', role: 'USER' } };
            authService.login.mockResolvedValue(serviceResponse);

            const fakeReq = { user: buildAuthenticatedUser() } as any;
            const result = await controller.login(fakeReq);

            expect(result).toBe(serviceResponse);
        });

        it('should propagate exceptions thrown by authService.login', async () => {
            authService.login.mockRejectedValue(new Error('InvalidCredentials'));

            const fakeReq = { user: buildAuthenticatedUser() } as any;
            await expect(controller.login(fakeReq)).rejects.toThrow('InvalidCredentials');
        });
    });


    // ─── getProfile ──────────────────────────────────────────────────────────

    describe('getProfile', () => {
        it('should delegate to authService.getMe with the sub from the current user', async () => {
            const storedUser = buildUser();
            const currentUser = { sub: storedUser.userPublicId, role: storedUser.role };
            const expectedProfile = {
                userId: storedUser.userPublicId,
                name: storedUser.name,
                email: storedUser.email,
                role: storedUser.role,
            };

            authService.getMe.mockResolvedValue(expectedProfile);

            const result = await controller.getProfile(currentUser);

            expect(authService.getMe).toHaveBeenCalledOnce();
            expect(authService.getMe).toHaveBeenCalledWith(storedUser.userPublicId);
            expect(result).toEqual(expectedProfile);
        });

        it('should return whatever the service resolves with', async () => {
            const profile = { userId: 'uuid-42', name: 'Jane', email: 'jane@example.com', role: 'ADMIN' };
            authService.getMe.mockResolvedValue(profile);

            const result = await controller.getProfile({ sub: 'uuid-42', role: 'ADMIN' });

            expect(result).toBe(profile);
        });

        it('should propagate exceptions thrown by authService.getMe', async () => {
            authService.getMe.mockRejectedValue(new Error('Unauthorized'));

            await expect(
                controller.getProfile({ sub: 'non-existent-id', role: 'USER' }),
            ).rejects.toThrow('Unauthorized');
        });

        it('should use user.sub as the public identifier when calling getMe', async () => {
            const publicId = 'c0ffee00-dead-beef-1234-000000000001';
            authService.getMe.mockResolvedValue({ userId: publicId, name: 'Jane', email: 'jane@example.com', role: 'ADMIN' });

            await controller.getProfile({ sub: publicId });

            expect(authService.getMe).toHaveBeenCalledWith(publicId);
        });
    });
});
