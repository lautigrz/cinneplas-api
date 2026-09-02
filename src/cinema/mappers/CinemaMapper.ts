import type { Cinema } from "../../generated/prisma/client.js";
import type { CinemaWithRooms } from "../types/CinemaWithRooms.js";
import type { CinemaResponse } from "../contracts/cinema.schemas.js";

export class CinemaMapper {
    static toResponse(cinema: CinemaWithRooms): CinemaResponse {
        return {
            idPublic: cinema.idPublic,
            name: cinema.name,
            address: cinema.address,
            rooms: cinema.rooms.map((room) => ({
                name: room.name,
                capacity: room.capacity,
            })),
        };
    }

    static toCreate(cinema: Cinema): CinemaResponse {
        return {
            idPublic: cinema.idPublic,
            name: cinema.name,
            address: cinema.address,
        };
    }

    static toUpdate(cinema: Cinema): CinemaResponse {
        return {
            idPublic: cinema.idPublic,
            name: cinema.name,
            address: cinema.address,
        };
    }
}