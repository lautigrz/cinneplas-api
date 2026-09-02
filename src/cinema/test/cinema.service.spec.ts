import { beforeEach, describe, expect, it } from 'vitest';

import { CinemaService } from '../CinemaService.js';
import {
    createMockCinemaRepository,
    type MockCinemaRepository,
} from './helpers/cinema.mocks.js';
import {
    buildCinema,
    buildCinemaWithRooms,
    buildCreateCinemaInput,
} from './helpers/cinema.fixtures.js';
import { CinemaResponseDTO } from '../dto/CinemaResponseDTO.js';
import { CinemaRoomResponseDTO } from '../dto/CinemaRoomResponseDTO.js';

// ─────────────────────────────────────────────────────────────────────────────

describe('CinemaService', () => {
    let service: CinemaService;
    let cinemaRepository: MockCinemaRepository;

    beforeEach(() => {
        cinemaRepository = createMockCinemaRepository();
        service = new CinemaService(cinemaRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });


    // ─── create ──────────────────────────────────────────────────────────────

    describe('create', () => {
        it('should create a cinema and return a CinemaResponseDTO', async () => {
            const input = buildCreateCinemaInput();
            const stored = buildCinema({ name: input.name, address: input.address });

            cinemaRepository.create.mockResolvedValue(stored);

            const result = await service.create(input);

            expect(result).toBeInstanceOf(CinemaResponseDTO);
            expect(result).toEqual(
                expect.objectContaining({
                    idPublic: stored.idPublic,
                    name: stored.name,
                    address: stored.address,
                }),
            );
        });

        it('should delegate creation to the repository with the provided input', async () => {
            const input = buildCreateCinemaInput({ name: 'Cine Lux' });

            cinemaRepository.create.mockResolvedValue(buildCinema());

            await service.create(input);

            expect(cinemaRepository.create).toHaveBeenCalledWith(input);
        });

        it('should NOT include rooms in the create response', async () => {
            cinemaRepository.create.mockResolvedValue(buildCinema());

            const result = await service.create(buildCreateCinemaInput());

            // toCreate uses the base Cinema (no rooms), so rooms should be undefined
            expect(result.rooms).toBeUndefined();
        });
    });


    // ─── findAll ─────────────────────────────────────────────────────────────

    describe('findAll', () => {
        it('should return an array of CinemaResponseDTO', async () => {
            cinemaRepository.findAll.mockResolvedValue([
                buildCinemaWithRooms(),
                buildCinemaWithRooms({ idPublic: 'a1b2c3d4-0000-0000-0000-000000000002', name: 'Cine Norte' }),
            ]);

            const result = await service.findAll();

            expect(result).toHaveLength(2);
            result.forEach((item) => expect(item).toBeInstanceOf(CinemaResponseDTO));
        });

        it('should return an empty array when there are no cinemas', async () => {
            cinemaRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('should include mapped rooms in each response', async () => {
            const cinemaWithRooms = buildCinemaWithRooms({
                rooms: [{ name: 'Sala A', capacity: 100 }],
            });

            cinemaRepository.findAll.mockResolvedValue([cinemaWithRooms]);

            const [result] = await service.findAll();

            expect(result.rooms).toHaveLength(1);
            expect(result.rooms![0]).toBeInstanceOf(CinemaRoomResponseDTO);
            expect(result.rooms![0]).toEqual(
                expect.objectContaining({ name: 'Sala A', capacity: 100 }),
            );
        });
    });


    // ─── findById ────────────────────────────────────────────────────────────

    describe('findById', () => {
        it('should return a CinemaResponseDTO when the cinema exists', async () => {
            const cinema = buildCinemaWithRooms();

            cinemaRepository.findById.mockResolvedValue(cinema);

            const result = await service.findById(cinema.idPublic);

            expect(result).toBeInstanceOf(CinemaResponseDTO);
            expect(result).toEqual(
                expect.objectContaining({
                    idPublic: cinema.idPublic,
                    name: cinema.name,
                }),
            );
        });

        it('should return null when the cinema does not exist', async () => {
            cinemaRepository.findById.mockResolvedValue(null);

            const result = await service.findById('non-existent-id');

            expect(result).toBeNull();
        });

        it('should look up the cinema by the provided id', async () => {
            const id = 'a1b2c3d4-0000-0000-0000-000000000001';
            cinemaRepository.findById.mockResolvedValue(buildCinemaWithRooms());

            await service.findById(id);

            expect(cinemaRepository.findById).toHaveBeenCalledWith(id);
        });

        it('should include rooms in the response', async () => {
            const cinema = buildCinemaWithRooms({
                rooms: [{ name: 'Sala 3D', capacity: 200 }],
            });

            cinemaRepository.findById.mockResolvedValue(cinema);

            const result = await service.findById(cinema.idPublic);

            expect(result!.rooms).toHaveLength(1);
            expect(result!.rooms![0].name).toBe('Sala 3D');
        });
    });


    // ─── update ──────────────────────────────────────────────────────────────

    describe('update', () => {
        it('should return a CinemaResponseDTO after updating', async () => {
            const input = buildCreateCinemaInput({ name: 'Cine Renovado' });
            const updated = buildCinema({ name: input.name });

            cinemaRepository.update.mockResolvedValue(updated);

            const result = await service.update(updated.idPublic, input);

            expect(result).toBeInstanceOf(CinemaResponseDTO);
            expect(result.name).toBe('Cine Renovado');
        });

        it('should delegate the update to the repository with correct arguments', async () => {
            const id = 'a1b2c3d4-0000-0000-0000-000000000001';
            const input = buildCreateCinemaInput({ address: 'Nueva dirección 999' });

            cinemaRepository.update.mockResolvedValue(buildCinema());

            await service.update(id, input);

            expect(cinemaRepository.update).toHaveBeenCalledWith(id, input);
        });
    });


    // ─── delete ──────────────────────────────────────────────────────────────

    describe('delete', () => {
        it('should throw an error because the method is not yet implemented', async () => {
            await expect(service.delete('any-id')).rejects.toThrow(
                'Method not implemented.',
            );
        });
    });
});
