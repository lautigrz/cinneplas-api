import { describe, it, expect, vi, beforeEach } from "vitest";
import { CinemaRepository } from "../CinemaRepository.js";
import type { CreateCinemaInput } from "../contracts/cinema.schemas.js";

const CINEMA_UUID = "00000000-0000-0000-0000-000000000001";

describe("CinemaRepository", () => {
    let repository: CinemaRepository;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = {
            cinema: {
                create: vi.fn(),
                findMany: vi.fn(),
                findUnique: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
            },
        };

        repository = new CinemaRepository(mockPrisma as any);
    });

    describe("create", () => {
        it("should create cinema with provided data", async () => {
            const input: CreateCinemaInput = {
                name: "Cineplas Palermo",
                address: "Av. Santa Fe 4500",
            };
            const created = { id: 1, idPublic: CINEMA_UUID, ...input };
            mockPrisma.cinema.create.mockResolvedValue(created);

            const result = await repository.create(input);

            expect(mockPrisma.cinema.create).toHaveBeenCalledWith({ data: input });
            expect(result).toEqual(created);
        });
    });

    describe("findAll", () => {
        it("should return all cinemas including rooms with name and capacity", async () => {
            const cinemas = [
                {
                    id: 1,
                    idPublic: CINEMA_UUID,
                    name: "Cineplas Palermo",
                    address: "Av. Santa Fe 4500",
                    rooms: [{ name: "Sala 1", capacity: 100 }],
                },
            ];
            mockPrisma.cinema.findMany.mockResolvedValue(cinemas);

            const result = await repository.findAll();

            expect(mockPrisma.cinema.findMany).toHaveBeenCalledWith({
                include: {
                    rooms: {
                        select: {
                            name: true,
                            capacity: true,
                        },
                    },
                },
            });
            expect(result).toEqual(cinemas);
        });
    });

    describe("findById", () => {
        it("should return cinema by idPublic including all room details", async () => {
            const cinema = {
                id: 1,
                idPublic: CINEMA_UUID,
                name: "Cineplas Palermo",
                rooms: [],
            };
            mockPrisma.cinema.findUnique.mockResolvedValue(cinema);

            const result = await repository.findById(CINEMA_UUID);

            expect(mockPrisma.cinema.findUnique).toHaveBeenCalledWith({
                where: { idPublic: CINEMA_UUID },
                include: { rooms: true },
            });
            expect(result).toEqual(cinema);
        });

        it("should return null when cinema not found", async () => {
            mockPrisma.cinema.findUnique.mockResolvedValue(null);

            const result = await repository.findById("non-existent-uuid");

            expect(result).toBeNull();
        });
    });

    describe("update", () => {
        it("should update cinema by idPublic", async () => {
            const input: CreateCinemaInput = {
                name: "Cineplas Palermo Renovado",
                address: "Av. Santa Fe 4600",
            };
            const updated = { id: 1, idPublic: CINEMA_UUID, ...input };
            mockPrisma.cinema.update.mockResolvedValue(updated);

            const result = await repository.update(CINEMA_UUID, input);

            expect(mockPrisma.cinema.update).toHaveBeenCalledWith({
                where: { idPublic: CINEMA_UUID },
                data: {
                    name: input.name,
                    address: input.address,
                },
            });
            expect(result).toEqual(updated);
        });
    });

    describe("delete", () => {
        it("should delete cinema by idPublic", async () => {
            mockPrisma.cinema.delete.mockResolvedValue({ idPublic: CINEMA_UUID });

            const result = await repository.delete(CINEMA_UUID);

            expect(mockPrisma.cinema.delete).toHaveBeenCalledWith({
                where: { idPublic: CINEMA_UUID },
            });
            expect(result).toEqual({ idPublic: CINEMA_UUID });
        });
    });
});
