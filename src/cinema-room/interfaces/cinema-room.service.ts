import type { CreateCinemaRoomInput, PatchCinemaRoomInput, CinemaRoomResponse } from "../contracts/cinema-room.schema.js";

export interface ICinemaRoomService {
    createRoomWithSeats(data: CreateCinemaRoomInput): Promise<CinemaRoomResponse>;
    getRoomByIdPublic(idPublic: string): Promise<CinemaRoomResponse | null>;
    updateRoom(idPublic: string, data: PatchCinemaRoomInput): Promise<CinemaRoomResponse>;
}

export const CINEMA_ROOM_SERVICE = Symbol("CINEMA_ROOM_SERVICE");
