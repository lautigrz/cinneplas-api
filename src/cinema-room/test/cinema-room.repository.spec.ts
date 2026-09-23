import { describe, it, expect, vi, beforeEach } from "vitest";
import { CinemaRoomRepository } from "../CinemaRoomRepository.js";
import type { CreateCinemaRoomInput, PatchCinemaRoomInput } from "../contracts/cinema-room.schema.js";

const CINEMA_UUID = "00000000-0000-0000-0000-000000000001";
const ROOM_UUID   = "00000000-0000-0000-0000-000000000010";

describe("CinemaRoomRepository", () => {
    let repository: CinemaRoomRepository;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = {
            cinemaRoom: {
                findFirst: vi.fn(),
                findUnique: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
            },
            cinema: {
                findUnique: vi.fn(),
            },
            seats: {
                update: vi.fn(),
            },
            $transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => cb(mockPrisma)),
        };

        repository = new CinemaRoomRepository(mockPrisma as any);
    });

    describe("findRoomByIdPublic", () => {
        it("should return room id when room and cinema match", async () => {
            mockPrisma.cinemaRoom.findFirst.mockResolvedValue({ id: 10 });

            const result = await repository.findRoomByIdPublic(ROOM_UUID, CINEMA_UUID);

            expect(mockPrisma.cinemaRoom.findFirst).toHaveBeenCalledWith({
                where: {
                    idPublic: ROOM_UUID,
                    cinema: { idPublic: CINEMA_UUID },
                },
                select: { id: true },
            });
            expect(result).toEqual({ id: 10 });
        });

        it("should return null when room does not belong to cinema or does not exist", async () => {
            mockPrisma.cinemaRoom.findFirst.mockResolvedValue(null);

            const result = await repository.findRoomByIdPublic(ROOM_UUID, CINEMA_UUID);

            expect(result).toBeNull();
        });
    });

    describe("findCinemaByIdPublic", () => {
        it("should return cinema id when found", async () => {
            mockPrisma.cinema.findUnique.mockResolvedValue({ id: 1 });

            const result = await repository.findCinemaByIdPublic(CINEMA_UUID);

            expect(mockPrisma.cinema.findUnique).toHaveBeenCalledWith({
                where: { idPublic: CINEMA_UUID },
                select: { id: true },
            });
            expect(result).toEqual({ id: 1 });
        });

        it("should return null when cinema not found", async () => {
            mockPrisma.cinema.findUnique.mockResolvedValue(null);

            const result = await repository.findCinemaByIdPublic(CINEMA_UUID);

            expect(result).toBeNull();
        });
    });

    describe("createWithSeats", () => {
        it("should create room with nested seats", async () => {
            const input: CreateCinemaRoomInput = {
                cinemaIdPublic: CINEMA_UUID,
                name: "Sala VIP",
                capacity: 2,
                seats: [
                    { row: "A", number: 1, positionX: 0, positionY: 0, price: 1500, type: "VIP" },
                    { row: "A", number: 2, positionX: 1, positionY: 0, price: 1500, isActive: true, type: "VIP" },
                ],
            };

            const createdRoom = { id: 1, idPublic: ROOM_UUID, name: "Sala VIP", seats: [] };
            mockPrisma.cinemaRoom.create.mockResolvedValue(createdRoom);

            const result = await repository.createWithSeats(1, input);

            expect(mockPrisma.cinemaRoom.create).toHaveBeenCalledWith({
                data: {
                    cinemaId: 1,
                    name: "Sala VIP",
                    capacity: 2,
                    seats: {
                        create: [
                            { row: "A", number: 1, positionX: 0, positionY: 0, price: 1500, isActive: false, type: "VIP" },
                            { row: "A", number: 2, positionX: 1, positionY: 0, price: 1500, isActive: true, type: "VIP" },
                        ],
                    },
                },
                include: { seats: true },
            });
            expect(result).toEqual(createdRoom);
        });
    });

    describe("findByIdPublic", () => {
        it("should return room with seats", async () => {
            const room = { id: 1, idPublic: ROOM_UUID, name: "Sala 1", seats: [] };
            mockPrisma.cinemaRoom.findUnique.mockResolvedValue(room);

            const result = await repository.findByIdPublic(ROOM_UUID);

            expect(mockPrisma.cinemaRoom.findUnique).toHaveBeenCalledWith({
                where: { idPublic: ROOM_UUID },
                include: { seats: true },
            });
            expect(result).toEqual(room);
        });

        it("should return null if not found", async () => {
            mockPrisma.cinemaRoom.findUnique.mockResolvedValue(null);

            const result = await repository.findByIdPublic(ROOM_UUID);

            expect(result).toBeNull();
        });
    });

    describe("updateRoom", () => {
        it("should update room details and seats inside transaction", async () => {
            const patchData: PatchCinemaRoomInput = {
                name: "Sala Renovada",
                capacity: 80,
                seats: [
                    { id: 101, row: "B", price: 2000, isActive: true },
                ],
            };

            const updatedRoom = { id: 1, idPublic: ROOM_UUID, name: "Sala Renovada", capacity: 80, seats: [] };
            mockPrisma.cinemaRoom.findUnique.mockResolvedValue(updatedRoom);

            const result = await repository.updateRoom(ROOM_UUID, patchData);

            expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
            expect(mockPrisma.cinemaRoom.update).toHaveBeenCalledWith({
                where: { idPublic: ROOM_UUID },
                data: { name: "Sala Renovada", capacity: 80 },
            });
            expect(mockPrisma.seats.update).toHaveBeenCalledWith({
                where: { id: 101 },
                data: { row: "B", price: 2000, isActive: true },
            });
            expect(mockPrisma.cinemaRoom.findUnique).toHaveBeenCalledWith({
                where: { idPublic: ROOM_UUID },
                include: { seats: true },
            });
            expect(result).toEqual(updatedRoom);
        });

        it("should not call room.update if neither name nor capacity is updated", async () => {
            const patchData: PatchCinemaRoomInput = {
                seats: [{ id: 101, price: 1800 }],
            };

            mockPrisma.cinemaRoom.findUnique.mockResolvedValue({ idPublic: ROOM_UUID });

            await repository.updateRoom(ROOM_UUID, patchData);

            expect(mockPrisma.cinemaRoom.update).not.toHaveBeenCalled();
            expect(mockPrisma.seats.update).toHaveBeenCalledWith({
                where: { id: 101 },
                data: { price: 1800 },
            });
        });
    });
});
