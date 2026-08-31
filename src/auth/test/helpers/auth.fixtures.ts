import { Role, type User } from '../../../generated/prisma/client.js';
import type { RegisterInput } from '../../schemas/RegisterSchema.js';
import type { LoginInput } from '../../schemas/LoginSchema.js';

export const HASHED_PASSWORD =
  '$2b$10$hashedPasswordHashedPasswordHashedPasswordHashedPassw';

export function buildRegisterInput(
  overrides: Partial<RegisterInput> = {},
): RegisterInput {
  return {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    ...overrides,
  };
}

export function buildLoginInput(
  overrides: Partial<LoginInput> = {},
): LoginInput {
  return {
    email: 'john@example.com',
    password: 'password123',
    ...overrides,
  };
}


export function buildUser(overrides: Partial<User> = {}): User {
  return {
    userId: 1,
    userPublicId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'John Doe',
    email: 'john@example.com',
    password: HASHED_PASSWORD,
    role: Role.User,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  };
}
