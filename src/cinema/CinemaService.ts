import type { ICinemaRepository } from "./interfaces/cinema.repository.js";
import type { ICinemaService } from "./interfaces/cinema.service.js";
import type { CreateCinemaInput, CinemaResponse } from "./contracts/cinema.schemas.js";
import { CinemaMapper } from "./mappers/CinemaMapper.js";
import { Inject, Injectable } from "@nestjs/common";
import { CINEMA_REPOSITORY } from "./interfaces/cinema.repository.js";

@Injectable()
export class CinemaService implements ICinemaService {
    constructor(
        @Inject(CINEMA_REPOSITORY)
        private readonly cinemaRepository: ICinemaRepository
    ) { }

    async create(data: CreateCinemaInput): Promise<CinemaResponse> {
        return CinemaMapper.toCreate(await this.cinemaRepository.create(data));
    }

    async findAll(): Promise<CinemaResponse[]> {
        const cinemas = await this.cinemaRepository.findAll();
        return cinemas.map(CinemaMapper.toResponse);
    }

    async findById(id: string): Promise<CinemaResponse | null> {
        const cinema = await this.cinemaRepository.findById(id);
        if (!cinema) return null;
        return CinemaMapper.toResponse(cinema);
    }

    async update(id: string, data: CreateCinemaInput): Promise<CinemaResponse> {
        const cinema = await this.cinemaRepository.update(id, data);
        return CinemaMapper.toUpdate(cinema);
    }

    async delete(id: string): Promise<CinemaResponse> {
        throw new Error("Method not implemented.");
    }
}