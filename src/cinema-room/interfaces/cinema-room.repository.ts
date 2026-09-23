import type { CreateCinemaRoomInput, PatchCinemaRoomInput } from "../contracts/cinema-room.schema.js";

export interface CinemaRoomRepository {
    findCinemaByIdPublic(idPublic: string): Promise<{ id: number } | null>;
    findByIdPublic(idPublic: string): Promise<any | null>;
    createWithSeats(cinemaId: number, data: CreateCinemaRoomInput): Promise<any>;
    updateRoom(idPublic: string, data: PatchCinemaRoomInput): Promise<any>;
    findRoomByIdPublic(idPublicRoom: string, idPublicCinema: string): Promise<{ id: number } | null>;

}

export const CINEMA_ROOM_REPOSITORY = Symbol("CINEMA_ROOM_REPOSITORY");
