import type { Cinema } from '../../../generated/prisma/client.js';
import type { CreateCinemaInput } from '../../contracts/cinema.schemas.js';
import type { CinemaWithRooms } from '../../types/CinemaWithRooms.js';

export function buildCreateCinemaInput(
    overrides: Partial<CreateCinemaInput> = {},
): CreateCinemaInput {
    return {
        name: 'Cineplas Centro',
        address: 'Av. Corrientes 1234, CABA',
        ...overrides,
    };
}

export function buildCinema(overrides: Partial<Cinema> = {}): Cinema {
    return {
        id: 1,
        idPublic: 'a1b2c3d4-0000-0000-0000-000000000001',
        name: 'Cineplas Centro',
        address: 'Av. Corrientes 1234, CABA',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

export function buildCinemaWithRooms(
    overrides: Partial<CinemaWithRooms> = {},
): CinemaWithRooms {
    return {
        id: 1,
        idPublic: 'a1b2c3d4-0000-0000-0000-000000000001',
        name: 'Cineplas Centro',
        address: 'Av. Corrientes 1234, CABA',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        rooms: [
            { name: 'Sala 1', capacity: 120 },
            { name: 'Sala 2', capacity: 80 },
        ],
        ...overrides,
    };
}
