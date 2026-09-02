import type { ICinemaRepository } from "./interfaces/cinema.repository.js";
import type { ICinemaService } from "./interfaces/cinema.service.js";
import type { CreateCinemaInput } from "./schema/CinemaSchema.js";
import type { CinemaResponseDTO } from "./dto/CinemaResponseDTO.js";
import { CinemaMapper } from "./mappers/CinemaMapper.js";
import { Inject, Injectable } from "@nestjs/common";
import { CINEMA_REPOSITORY } from "./interfaces/cinema.repository.js";

@Injectable()
export class CinemaService implements ICinemaService {
    constructor(
        @Inject(CINEMA_REPOSITORY)
        private readonly cinemaRepository: ICinemaRepository
    ) { }

    async create(data: CreateCinemaInput): Promise<CinemaResponseDTO> {
        return CinemaMapper.toCreate(await this.cinemaRepository.create(data));
    }

    async findAll(): Promise<CinemaResponseDTO[]> {
        const cinemas = await this.cinemaRepository.findAll();
        return cinemas.map(CinemaMapper.toResponse);
    }

    async findById(id: string): Promise<CinemaResponseDTO | null> {
        const cinema = await this.cinemaRepository.findById(id);
        if (!cinema) return null;
        return CinemaMapper.toResponse(cinema);
    }

    async update(id: string, data: CreateCinemaInput): Promise<CinemaResponseDTO> {
        const cinema = await this.cinemaRepository.update(id, data);
        return CinemaMapper.toUpdate(cinema);
    }

    async delete(id: string): Promise<CinemaResponseDTO> {
        throw new Error("Method not implemented.");
    }
}