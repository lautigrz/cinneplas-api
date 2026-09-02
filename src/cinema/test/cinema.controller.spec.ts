import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockedFunction } from 'vitest';

import { CinemaController } from '../CinemaController.js';
import type { ICinemaService } from '../interfaces/cinema.service.js';
import {
    buildCinemaWithRooms,
    buildCreateCinemaInput,
} from './helpers/cinema.fixtures.js';
import { CinemaResponseDTO } from '../dto/CinemaResponseDTO.js';

// ─── Mock ICinemaService ──────────────────────────────────────────────────────

type MockCinemaService = {
    [K in keyof ICinemaService]: MockedFunction<ICinemaService[K]>;
};

function createMockCinemaService(): MockCinemaService {
    return {
        create: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
}

function buildCinemaResponseDTO(overrides?: Partial<{ idPublic: string; name: string; address: string }>): CinemaResponseDTO {
    const cinema = buildCinemaWithRooms(overrides);
    return new CinemaResponseDTO(cinema.idPublic, cinema.name, cinema.address);
}

// ─────────────────────────────────────────────────────────────────────────────

describe('CinemaController', () => {
    let controller: CinemaController;
    let cinemaService: MockCinemaService;

    beforeEach(() => {
        vi.clearAllMocks();
        cinemaService = createMockCinemaService();
        controller = new CinemaController(cinemaService as unknown as ICinemaService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });


    // ─── create ──────────────────────────────────────────────────────────────

    describe('create', () => {
        it('should delegate to cinemaService.create with the provided body', async () => {
            const input = buildCreateCinemaInput();
            const dto = buildCinemaResponseDTO({ name: input.name, address: input.address });

            cinemaService.create.mockResolvedValue(dto);

            const result = await controller.create(input);

            expect(cinemaService.create).toHaveBeenCalledOnce();
            expect(cinemaService.create).toHaveBeenCalledWith(input);
            expect(result).toBe(dto);
        });

        it('should return whatever the service resolves with', async () => {
            const dto = buildCinemaResponseDTO();
            cinemaService.create.mockResolvedValue(dto);

            const result = await controller.create(buildCreateCinemaInput());

            expect(result).toBe(dto);
        });

        it('should propagate exceptions thrown by cinemaService.create', async () => {
            cinemaService.create.mockRejectedValue(new Error('ServiceError'));

            await expect(controller.create(buildCreateCinemaInput())).rejects.toThrow('ServiceError');
        });
    });


    // ─── getAll ──────────────────────────────────────────────────────────────

    describe('getAll', () => {
        it('should delegate to cinemaService.findAll', async () => {
            const dtos = [
                buildCinemaResponseDTO(),
                buildCinemaResponseDTO({ idPublic: 'a1b2c3d4-0000-0000-0000-000000000002', name: 'Cine Norte' }),
            ];

            cinemaService.findAll.mockResolvedValue(dtos);

            const result = await controller.getAll();

            expect(cinemaService.findAll).toHaveBeenCalledOnce();
            expect(result).toBe(dtos);
        });

        it('should return an empty array when there are no cinemas', async () => {
            cinemaService.findAll.mockResolvedValue([]);

            const result = await controller.getAll();

            expect(result).toEqual([]);
        });

        it('should return whatever the service resolves with', async () => {
            const dtos = [buildCinemaResponseDTO()];
            cinemaService.findAll.mockResolvedValue(dtos);

            const result = await controller.getAll();

            expect(result).toBe(dtos);
        });

        it('should propagate exceptions thrown by cinemaService.findAll', async () => {
            cinemaService.findAll.mockRejectedValue(new Error('DatabaseError'));

            await expect(controller.getAll()).rejects.toThrow('DatabaseError');
        });
    });
});
