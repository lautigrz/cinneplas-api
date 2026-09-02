import { describe, expect, it } from 'vitest';
import type { CinemaResponse, CinemaRoomResponse } from '../contracts/cinema.schemas.js';

import { CinemaMapper } from '../mappers/CinemaMapper.js';
import {
    buildCinema,
    buildCinemaWithRooms,
} from './helpers/cinema.fixtures.js';

// ─────────────────────────────────────────────────────────────────────────────

describe('CinemaMapper', () => {

    // ─── toResponse ──────────────────────────────────────────────────────────

    describe('toResponse', () => {
        it('should return a CinemaResponse object with the expected shape', () => {
            const cinema = buildCinemaWithRooms();
            const result = CinemaMapper.toResponse(cinema);

            expect(result).toMatchObject<CinemaResponse>({
                idPublic: cinema.idPublic,
                name: cinema.name,
                address: cinema.address,
                rooms: expect.any(Array),
            });
        });

        it('should map all base fields correctly', () => {
            const cinema = buildCinemaWithRooms({ name: 'Cine Sur', address: 'Av. Sur 100' });

            const result = CinemaMapper.toResponse(cinema);

            expect(result.idPublic).toBe(cinema.idPublic);
            expect(result.name).toBe('Cine Sur');
            expect(result.address).toBe('Av. Sur 100');
        });

        it('should map each room as a plain CinemaRoomResponse object', () => {
            const cinema = buildCinemaWithRooms({
                rooms: [
                    { name: 'Sala 1', capacity: 100 },
                    { name: 'Sala VIP', capacity: 50 },
                ],
            });

            const result = CinemaMapper.toResponse(cinema);

            expect(result.rooms).toHaveLength(2);
            result.rooms!.forEach((r: CinemaRoomResponse) => {
                expect(r).toHaveProperty('name');
                expect(r).toHaveProperty('capacity');
            });
        });

        it('should map room names and capacities correctly', () => {
            const cinema = buildCinemaWithRooms({
                rooms: [{ name: 'Sala 3D', capacity: 200 }],
            });

            const [room] = CinemaMapper.toResponse(cinema).rooms!;

            expect(room.name).toBe('Sala 3D');
            expect(room.capacity).toBe(200);
        });

        it('should return an empty rooms array when the cinema has no rooms', () => {
            const cinema = buildCinemaWithRooms({ rooms: [] });

            const result = CinemaMapper.toResponse(cinema);

            expect(result.rooms).toEqual([]);
        });
    });


    // ─── toCreate ────────────────────────────────────────────────────────────

    describe('toCreate', () => {
        it('should return a CinemaResponse plain object', () => {
            const result = CinemaMapper.toCreate(buildCinema());

            expect(result).toHaveProperty('idPublic');
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('address');
        });

        it('should map base fields from a Cinema entity (no rooms)', () => {
            const cinema = buildCinema({ name: 'Cine Nuevo', address: 'Calle Falsa 123' });

            const result = CinemaMapper.toCreate(cinema);

            expect(result.idPublic).toBe(cinema.idPublic);
            expect(result.name).toBe('Cine Nuevo');
            expect(result.address).toBe('Calle Falsa 123');
        });

        it('should not include a rooms property (Cinema entity has no rooms)', () => {
            const result = CinemaMapper.toCreate(buildCinema());

            expect(result.rooms).toBeUndefined();
        });
    });


    // ─── toUpdate ────────────────────────────────────────────────────────────

    describe('toUpdate', () => {
        it('should return a CinemaResponse plain object', () => {
            const result = CinemaMapper.toUpdate(buildCinema());

            expect(result).toHaveProperty('idPublic');
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('address');
        });

        it('should map the updated name and address', () => {
            const cinema = buildCinema({
                name: 'Cine Renovado',
                address: 'Av. Renovación 500',
            });

            const result = CinemaMapper.toUpdate(cinema);

            expect(result.name).toBe('Cine Renovado');
            expect(result.address).toBe('Av. Renovación 500');
        });

        it('should not include rooms', () => {
            const result = CinemaMapper.toUpdate(buildCinema());

            expect(result.rooms).toBeUndefined();
        });
    });
});
