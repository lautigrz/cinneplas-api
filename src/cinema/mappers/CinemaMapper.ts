import type { Cinema } from "../../generated/prisma/client.js";
import type { CinemaWithRooms } from "../types/CinemaWithRooms.js";
import { CinemaResponseDTO } from "../dto/CinemaResponseDTO.js";
import { CinemaRoomResponseDTO } from "../dto/CinemaRoomResponseDTO.js";

export class CinemaMapper {
    static toResponse(cinema: CinemaWithRooms) {
        return new CinemaResponseDTO(
            cinema.idPublic,
            cinema.name,
            cinema.address,
            cinema.rooms.map((room) => (new CinemaRoomResponseDTO(
                room.name,
                room.capacity
            )))
        )
    }

    static toCreate(cinema: Cinema) {
        return new CinemaResponseDTO(
            cinema.idPublic,
            cinema.name,
            cinema.address
        )
    }

    static toUpdate(cinema: Cinema) {
        return new CinemaResponseDTO(
            cinema.idPublic,
            cinema.name,
            cinema.address
        )
    }
}