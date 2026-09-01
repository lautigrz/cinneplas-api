import type { Cinema } from "../../generated/prisma/client.js";
import type { CreateCinemaInput } from "../schema/CinemaSchema.js";
import { CinemaWithRooms } from "../types/CinemaWithRooms.js";

export interface ICinemaRepository {
    create(data: CreateCinemaInput): Promise<Cinema>;
    findAll(): Promise<CinemaWithRooms[]>;
    findById(id: string): Promise<CinemaWithRooms | null>;
    update(id: string, data: CreateCinemaInput): Promise<Cinema>;
    delete(id: string): Promise<Cinema>;
}

export const CINEMA_REPOSITORY = Symbol("CINEMA_REPOSITORY");