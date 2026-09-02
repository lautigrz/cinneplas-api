import { describe, expect, it } from 'vitest';
import { Role } from '../../generated/prisma/client.js';

import { UserMapper } from '../mappers/user.mapper.js';
import { buildUser } from '../test/helpers/auth.fixtures.js';

// ─────────────────────────────────────────────────────────────────────────────────

describe('UserMapper', () => {
    describe('toProfile', () => {
        it('should map userPublicId to userId in the response', () => {
            const user = buildUser({ userPublicId: 'abc-def-123' });

            const result = UserMapper.toProfile(user);

            expect(result.userId).toBe('abc-def-123');
        });

        it('should include name, email and role', () => {
            const user = buildUser({ name: 'María García', email: 'maria@example.com', role: Role.ADMIN });

            const result = UserMapper.toProfile(user);

            expect(result.name).toBe('María García');
            expect(result.email).toBe('maria@example.com');
            expect(result.role).toBe(Role.ADMIN);
        });

        it('should NOT include the internal userId (integer primary key)', () => {
            const result = UserMapper.toProfile(buildUser());

            expect(result).not.toHaveProperty('userPublicId');
        });

        it('should NOT expose the password', () => {
            const result = UserMapper.toProfile(buildUser());

            expect(result).not.toHaveProperty('password');
        });

        it('should NOT expose createdAt or updatedAt', () => {
            const result = UserMapper.toProfile(buildUser());

            expect(result).not.toHaveProperty('createdAt');
            expect(result).not.toHaveProperty('updatedAt');
        });
    });

    describe('toLoginResponse', () => {
        it('should return a LoginResponseDTO with accessToken and user profile', () => {
            const user = buildUser();
            const token = 'my.jwt.token';

            const result = UserMapper.toLoginResponse(user, token);

            expect(result.accessToken).toBe(token);
            expect(result.user).toEqual({
                userId: user.userPublicId,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        });

        it('should NOT expose the password inside user', () => {
            const result = UserMapper.toLoginResponse(buildUser(), 'token');

            expect(result.user).not.toHaveProperty('password');
        });
    });
});
