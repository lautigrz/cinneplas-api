import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from '../guards/RolesGuard.js';

function buildExecutionContext(overrides: {
    user?: Record<string, unknown>;
    handlerRoles?: string[] | undefined;
    classRoles?: string[] | undefined;
}): ExecutionContext {
    const { user = { role: 'USER' }, handlerRoles, classRoles } = overrides;

    return {
        getHandler: vi.fn().mockReturnValue({}),
        getClass: vi.fn().mockReturnValue({}),
        switchToHttp: vi.fn().mockReturnValue({
            getRequest: vi.fn().mockReturnValue({ user }),
        }),
        // getAllAndOverride is called with (key, [handler, class])
        // The mock below is handled via the Reflector mock
    } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RolesGuard(reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should allow access when no roles are required (public handler)', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        const ctx = buildExecutionContext({ user: { role: 'USER' } });

        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should allow access when the user role matches the required role (exact case)', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

        const ctx = buildExecutionContext({ user: { role: 'ADMIN' } });

        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should allow access when the user role matches case-insensitively (lowercase role from DB)', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

        const ctx = buildExecutionContext({ user: { role: 'admin' } });

        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should deny access when the user role does NOT match the required role', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

        const ctx = buildExecutionContext({ user: { role: 'USER' } });

        expect(guard.canActivate(ctx)).toBe(false);
    });

    it('should allow access when the user has at least one of the required roles', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'MODERATOR']);

        const ctx = buildExecutionContext({ user: { role: 'MODERATOR' } });

        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should deny access when the user has none of the required roles', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'MODERATOR']);

        const ctx = buildExecutionContext({ user: { role: 'USER' } });

        expect(guard.canActivate(ctx)).toBe(false);
    });
});
