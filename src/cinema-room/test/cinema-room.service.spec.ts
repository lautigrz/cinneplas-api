import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockedFunction } from 'vitest';
import { CinemaRoomService } from '../CinemaRoomService.js';
import type { ICinemaRoomRepository } from '../interfaces/cinema-room.repository.js';
import { CinemaNotFoundException } from '../exceptions/CinemaNotFoundException.js';
import type { CreateCinemaRoomInput } from '../contracts/cinema-room.schema.js';

type MockCinemaRoomRepository = {
    [K in keyof ICinemaRoomRepository]: MockedFunction<ICinemaRoomRepository[K]>;
};

function createMockRepository(): MockCinemaRoomRepository {
    return {
        findCinemaByIdPublic: vi.fn(),
        createWithSeats: vi.fn(),
        findByIdPublic: vi.fn(),
        updateRoom: vi.fn()
    };
}

describe('CinemaRoomService', () => {
    let service: CinemaRoomService;
    let repository: MockCinemaRoomRepository;

    const mockInput: CreateCinemaRoomInput = {
        cinemaIdPublic: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Sala 1 IMAX',
        capacity: 100,
        seats: [
            {
                row: 'A',
                number: 1,
                positionX: 0,
                positionY: 0,
                price: 1500,
                isActive: true,
                type: 'STANDARD',
            },
            {
                row: 'A',
                number: 2,
                positionX: 1,
                positionY: 0,
                price: 2000,
                isActive: true,
                type: 'VIP',
            },
        ],
    };

    const mockPrismaRoom = {
        idPublic: '98b50e2d-dc99-43ef-b387-052637738f61',
        name: 'Sala 1 IMAX',
        capacity: 100,
        seats: [
            {
                id: 1,
                row: 'A',
                number: 1,
                positionX: 0,
                positionY: 0,
                price: 1500,
                isActive: true,
                type: 'STANDARD',
            },
            {
                id: 2,
                row: 'A',
                number: 2,
                positionX: 1,
                positionY: 0,
                price: 2000,
                isActive: true,
                type: 'VIP',
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        repository = createMockRepository();
        service = new CinemaRoomService(repository as unknown as ICinemaRoomRepository);
    });

    describe('createRoomWithSeats', () => {
        it('should throw CinemaNotFoundException when cinema does not exist', async () => {
            repository.findCinemaByIdPublic.mockResolvedValue(null);

            await expect(service.createRoomWithSeats(mockInput)).rejects.toThrow(CinemaNotFoundException);
            expect(repository.findCinemaByIdPublic).toHaveBeenCalledWith(mockInput.cinemaIdPublic);
            expect(repository.createWithSeats).not.toHaveBeenCalled();
        });

        it('should create room with seats when cinema exists', async () => {
            repository.findCinemaByIdPublic.mockResolvedValue({ id: 10 });
            repository.createWithSeats.mockResolvedValue(mockPrismaRoom);

            const result = await service.createRoomWithSeats(mockInput);

            expect(repository.findCinemaByIdPublic).toHaveBeenCalledWith(mockInput.cinemaIdPublic);
            expect(repository.createWithSeats).toHaveBeenCalledWith(10, mockInput);
            expect(result).toEqual({
                idPublic: '98b50e2d-dc99-43ef-b387-052637738f61',
                name: 'Sala 1 IMAX',
                capacity: 100,
                seats: [
                    {
                        id: 1,
                        row: 'A',
                        number: 1,
                        positionX: 0,
                        positionY: 0,
                        price: 1500,
                        isActive: true,
                        type: 'STANDARD',
                    },
                    {
                        id: 2,
                        row: 'A',
                        number: 2,
                        positionX: 1,
                        positionY: 0,
                        price: 2000,
                        isActive: true,
                        type: 'VIP',
                    },
                ],
            });
        });
    });

    describe('getRoomByIdPublic', () => {
        it('should return null when room is not found', async () => {
            repository.findByIdPublic.mockResolvedValue(null);

            const result = await service.getRoomByIdPublic('non-existent');

            expect(result).toBeNull();
        });

        it('should return mapped room response when room exists', async () => {
            repository.findByIdPublic.mockResolvedValue(mockPrismaRoom);

            const result = await service.getRoomByIdPublic('98b50e2d-dc99-43ef-b387-052637738f61');

            expect(result).toEqual({
                idPublic: '98b50e2d-dc99-43ef-b387-052637738f61',
                name: 'Sala 1 IMAX',
                capacity: 100,
                seats: [
                    {
                        id: 1,
                        row: 'A',
                        number: 1,
                        positionX: 0,
                        positionY: 0,
                        price: 1500,
                        isActive: true,
                        type: 'STANDARD',
                    },
                    {
                        id: 2,
                        row: 'A',
                        number: 2,
                        positionX: 1,
                        positionY: 0,
                        price: 2000,
                        isActive: true,
                        type: 'VIP',
                    },
                ],
            });
        });
    });
});
