import { describe, it, expect } from "vitest";
import { CinemaRoomMapper } from "../mappers/cinema.room.mapper.js";

describe("CinemaRoomMapper", () => {
    describe("toResponse", () => {
        it("should map Prisma room and seats with Decimal prices to CinemaRoomResponse", () => {
            const prismaRoom = {
                idPublic: "room-uuid-1",
                name: "Sala 1 — Gran Pantalla",
                capacity: 100,
                seats: [
                    {
                        id: 1,
                        row: "A",
                        number: 1,
                        positionX: 0,
                        positionY: 0,
                        price: "1200.00",
                        isActive: true,
                        type: "STANDARD",
                    },
                    {
                        id: 2,
                        row: "A",
                        number: 2,
                        positionX: 1,
                        positionY: 0,
                        price: 1500,
                        isActive: false,
                        type: "VIP",
                    },
                ],
            };

            const result = CinemaRoomMapper.toResponse(prismaRoom);

            expect(result).toEqual({
                idPublic: "room-uuid-1",
                name: "Sala 1 — Gran Pantalla",
                capacity: 100,
                seats: [
                    {
                        id: 1,
                        row: "A",
                        number: 1,
                        positionX: 0,
                        positionY: 0,
                        price: 1200,
                        isActive: true,
                        type: "STANDARD",
                    },
                    {
                        id: 2,
                        row: "A",
                        number: 2,
                        positionX: 1,
                        positionY: 0,
                        price: 1500,
                        isActive: false,
                        type: "VIP",
                    },
                ],
            });
        });

        it("should handle room with empty seats array", () => {
            const prismaRoom = {
                idPublic: "room-uuid-2",
                name: "Sala Vacía",
                capacity: 0,
                seats: [],
            };

            const result = CinemaRoomMapper.toResponse(prismaRoom);

            expect(result.idPublic).toBe("room-uuid-2");
            expect(result.seats).toHaveLength(0);
        });
    });
});
