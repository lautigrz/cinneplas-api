import { Inject, Injectable } from "@nestjs/common";
import { CINEMA_ROOM_REPOSITORY, type CinemaRoomRepository } from "./interfaces/cinema-room.repository.js";
import type { ICinemaRoomService } from "./interfaces/cinema-room.service.js";
import type { CreateCinemaRoomInput, PatchCinemaRoomInput, CinemaRoomResponse } from "./contracts/cinema-room.schema.js";
import { CinemaRoomMapper } from "./mappers/cinema.room.mapper.js";
import { CinemaNotFoundException } from "./exceptions/CinemaNotFoundException.js";
import { CinemaRoomNotFoundException } from "./exceptions/CinemaRoomNotFoundException.js";

@Injectable()
export class CinemaRoomService implements ICinemaRoomService {
    constructor(
        @Inject(CINEMA_ROOM_REPOSITORY)
        private readonly cinemaRoomRepository: CinemaRoomRepository
    ) { }

    async createRoomWithSeats(data: CreateCinemaRoomInput): Promise<CinemaRoomResponse> {
        const cinema = await this.cinemaRoomRepository.findCinemaByIdPublic(data.cinemaIdPublic);
        if (!cinema) {
            throw new CinemaNotFoundException(data.cinemaIdPublic);
        }

        const room = await this.cinemaRoomRepository.createWithSeats(cinema.id, data);
        return CinemaRoomMapper.toResponse(room);
    }

    async getRoomByIdPublic(idPublic: string): Promise<CinemaRoomResponse | null> {
        const room = await this.cinemaRoomRepository.findByIdPublic(idPublic);
        if (!room) return null;
        return CinemaRoomMapper.toResponse(room);
    }

    async updateRoom(idPublic: string, data: PatchCinemaRoomInput): Promise<CinemaRoomResponse> {
        const existing = await this.cinemaRoomRepository.findByIdPublic(idPublic);
        if (!existing) {
            throw new CinemaRoomNotFoundException(idPublic);
        }

        const updated = await this.cinemaRoomRepository.updateRoom(idPublic, data);
        return CinemaRoomMapper.toResponse(updated);
    }
}
