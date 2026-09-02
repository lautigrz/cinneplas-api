import { vi, type MockedFunction } from 'vitest';
import type { IAuthRepository } from '../../interfaces/auth.repository.js';
import type { JwtService } from '@nestjs/jwt';


export type MockAuthRepository = {
  [K in keyof IAuthRepository]: MockedFunction<IAuthRepository[K]>;
};

export function createMockAuthRepository(): MockAuthRepository {
  return {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
  };
}

export type MockJwtService = {
  sign: MockedFunction<JwtService['sign']>;
};

export function createMockJwtService(): MockJwtService {
  return {
    sign: vi.fn().mockReturnValue('mocked.jwt.token'),
  };
}
