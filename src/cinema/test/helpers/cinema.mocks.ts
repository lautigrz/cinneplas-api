import { vi, type MockedFunction } from 'vitest';
import type { ICinemaRepository } from '../../interfaces/cinema.repository.js';

export type MockCinemaRepository = {
    [K in keyof ICinemaRepository]: MockedFunction<ICinemaRepository[K]>;
};

export function createMockCinemaRepository(): MockCinemaRepository {
    return {
        create: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
}
