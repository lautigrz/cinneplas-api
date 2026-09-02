import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockedFunction } from 'vitest';

import { CinemaController } from '../CinemaController.js';
import type { ICinemaService } from '../interfaces/cinema.service.js';
import type { CinemaResponse } from '../contracts/cinema.schemas.js';
import {
    buildCinemaWithRooms,
    buildCreateCinemaInput,
} from './helpers/cinema.fixtures.js';

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

function buildCinemaResponse(overrides?: Partial<{ idPublic: string; name: string; address: string }>): CinemaResponse {
    const cinema = buildCinemaWithRooms(overrides);
    return { idPublic: cinema.idPublic, name: cinema.name, address: cinema.address };
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
            const response = buildCinemaResponse({ name: input.name, address: input.address });

            cinemaService.create.mockResolvedValue(response);

            const result = await controller.create(input);

            expect(cinemaService.create).toHaveBeenCalledOnce();
            expect(cinemaService.create).toHaveBeenCalledWith(input);
            expect(result).toBe(response);
        });

        it('should return whatever the service resolves with', async () => {
            const response = buildCinemaResponse();
            cinemaService.create.mockResolvedValue(response);

            const result = await controller.create(buildCreateCinemaInput());

            expect(result).toBe(response);
        });

        it('should propagate exceptions thrown by cinemaService.create', async () => {
            cinemaService.create.mockRejectedValue(new Error('ServiceError'));

            await expect(controller.create(buildCreateCinemaInput())).rejects.toThrow('ServiceError');
        });
    });


    // ─── getAll ──────────────────────────────────────────────────────────────

    describe('getAll', () => {
        it('should delegate to cinemaService.findAll', async () => {
            const responses = [
                buildCinemaResponse(),
                buildCinemaResponse({ idPublic: 'a1b2c3d4-0000-0000-0000-000000000002', name: 'Cine Norte' }),
            ];

            cinemaService.findAll.mockResolvedValue(responses);

            const result = await controller.getAll();

            expect(cinemaService.findAll).toHaveBeenCalledOnce();
            expect(result).toBe(responses);
        });

        it('should return an empty array when there are no cinemas', async () => {
            cinemaService.findAll.mockResolvedValue([]);

            const result = await controller.getAll();

            expect(result).toEqual([]);
        });

        it('should return whatever the service resolves with', async () => {
            const responses = [buildCinemaResponse()];
            cinemaService.findAll.mockResolvedValue(responses);

            const result = await controller.getAll();

            expect(result).toBe(responses);
        });

        it('should propagate exceptions thrown by cinemaService.findAll', async () => {
            cinemaService.findAll.mockRejectedValue(new Error('DatabaseError'));

            await expect(controller.getAll()).rejects.toThrow('DatabaseError');
        });
    });
});
