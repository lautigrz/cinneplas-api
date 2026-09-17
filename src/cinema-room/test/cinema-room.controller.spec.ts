import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockedFunction } from 'vitest';
import { CinemaRoomController } from '../CinemaRoomController.js';
import type { ICinemaRoomService } from '../interfaces/cinema-room.service.js';
import { NotFoundException } from '@nestjs/common';

type MockCinemaRoomService = {
    [K in keyof ICinemaRoomService]: MockedFunction<ICinemaRoomService[K]>;
};

function createMockService(): MockCinemaRoomService {
    return {
        createRoomWithSeats: vi.fn(),
        getRoomByIdPublic: vi.fn(),
        updateRoom: vi.fn()

    };
}

describe('CinemaRoomController', () => {
    let controller: CinemaRoomController;
    let service: MockCinemaRoomService;

    const mockResponse = {
        idPublic: '98b50e2d-dc99-43ef-b387-052637738f61',
        name: 'Sala 3D',
        capacity: 50,
        seats: [
            {
                id: 1,
                row: 'B',
                number: 5,
                positionX: 4,
                positionY: 1,
                price: 1200,
                isActive: true,
                type: 'STANDARD' as const,
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        service = createMockService();
        controller = new CinemaRoomController(service as unknown as ICinemaRoomService);
    });

    describe('create', () => {
        it('should delegate to service.createRoomWithSeats', async () => {
            const input = {
                cinemaIdPublic: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                name: 'Sala 3D',
                capacity: 50,
                seats: [
                    {
                        row: 'B',
                        number: 5,
                        positionX: 4,
                        positionY: 1,
                        price: 1200,
                        isActive: true,
                        type: 'STANDARD' as const,
                    },
                ],
            };

            service.createRoomWithSeats.mockResolvedValue(mockResponse);

            const result = await controller.create(input);

            expect(service.createRoomWithSeats).toHaveBeenCalledWith(input);
            expect(result).toBe(mockResponse);
        });
    });

    describe('getById', () => {
        it('should return room when found', async () => {
            service.getRoomByIdPublic.mockResolvedValue(mockResponse);

            const result = await controller.getById('98b50e2d-dc99-43ef-b387-052637738f61');

            expect(service.getRoomByIdPublic).toHaveBeenCalledWith('98b50e2d-dc99-43ef-b387-052637738f61');
            expect(result).toBe(mockResponse);
        });

        it('should throw NotFoundException when room does not exist', async () => {
            service.getRoomByIdPublic.mockResolvedValue(null);

            await expect(controller.getById('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });
});
