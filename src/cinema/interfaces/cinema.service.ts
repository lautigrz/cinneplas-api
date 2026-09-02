import type { CreateCinemaInput } from "../schema/CinemaSchema.js";
import type { CinemaResponseDTO } from "../dto/CinemaResponseDTO.js";

export interface ICinemaService {
    create(data: CreateCinemaInput): Promise<CinemaResponseDTO>;
    findAll(): Promise<CinemaResponseDTO[]>;
    findById(id: string): Promise<CinemaResponseDTO | null>;
    update(id: string, data: CreateCinemaInput): Promise<CinemaResponseDTO>;
    delete(id: string): Promise<CinemaResponseDTO>;
}

export const CINEMA_SERVICE = Symbol("CINEMA_SERVICE");