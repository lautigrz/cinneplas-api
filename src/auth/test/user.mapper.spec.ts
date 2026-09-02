import { describe, expect, it } from 'vitest';
import { Role } from '../../generated/prisma/client.js';

import { UserMapper } from '../mappers/user.mapper.js';
import { buildUser } from '../test/helpers/auth.fixtures.js';

// ─────────────────────────────────────────────────────────────────────────────

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

        it('should NOT include the internal userPublicId in the response (exposed as userId)', () => {
            const result = UserMapper.toProfile(buildUser());

            // The property is renamed: userPublicId → userId
            expect(result).not.toHaveProperty('userPublicId');
            expect(result).toHaveProperty('userId');
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
});
