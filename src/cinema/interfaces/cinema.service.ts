import type { CreateCinemaInput, CinemaResponse } from "../contracts/cinema.schemas.js";

export interface ICinemaService {
    create(data: CreateCinemaInput): Promise<CinemaResponse>;
    findAll(): Promise<CinemaResponse[]>;
    findById(id: string): Promise<CinemaResponse | null>;
    update(id: string, data: CreateCinemaInput): Promise<CinemaResponse>;
    delete(id: string): Promise<CinemaResponse>;
}

export const CINEMA_SERVICE = Symbol("CINEMA_SERVICE");