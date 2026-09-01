import { describe, expect, it } from 'vitest';
import { Role } from '../../generated/prisma/client.js';

import { UserMapper } from '../mappers/user.mapper.js';
import { buildUser } from '../test/helpers/auth.fixtures.js';

// ─────────────────────────────────────────────────────────────────────────────

describe('UserMapper', () => {
    describe('toResponse', () => {
        it('should map userPublicId to userId in the response', () => {
            const user = buildUser({ userPublicId: 'abc-def-123' });

            const result = UserMapper.toResponse(user);

            expect(result.userId).toBe('abc-def-123');
        });

        it('should include name, email and role', () => {
            const user = buildUser({ name: 'María García', email: 'maria@example.com', role: Role.ADMIN });

            const result = UserMapper.toResponse(user);

            expect(result.name).toBe('María García');
            expect(result.email).toBe('maria@example.com');
            expect(result.role).toBe(Role.ADMIN);
        });

        it('should NOT include the internal userId (integer primary key)', () => {
            const result = UserMapper.toResponse(buildUser());

            expect(result).not.toHaveProperty('userPublicId');
        });

        it('should NOT expose the password', () => {
            const result = UserMapper.toResponse(buildUser());

            expect(result).not.toHaveProperty('password');
        });

        it('should NOT expose createdAt or updatedAt', () => {
            const result = UserMapper.toResponse(buildUser());

            expect(result).not.toHaveProperty('createdAt');
            expect(result).not.toHaveProperty('updatedAt');
        });
    });
});
