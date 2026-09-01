import { PrismaService } from "../prisma/PrismaService.js";
import { ICinemaRepository } from "./interfaces/cinema.repository.js";
import type { CreateCinemaInput } from "./schema/CinemaSchema.js";
import type { Cinema } from "../generated/prisma/client.js";
import { CinemaWithRooms } from "./types/CinemaWithRooms.js";

export class CinemaRepository implements ICinemaRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateCinemaInput): Promise<Cinema> {
        return this.prisma.cinema.create({ data });
    }

    async findAll(): Promise<CinemaWithRooms[]> {
        return this.prisma.cinema.findMany({
            include: {
                rooms: {
                    select: {
                        name: true,
                        capacity: true
                    }
                }
            }
        });
    }

    async findById(id: string): Promise<CinemaWithRooms | null> {
        return this.prisma.cinema.findUnique({
            where: { idPublic: id },
            include: {
                rooms: true
            }
        });
    }

    async update(id: string, data: CreateCinemaInput): Promise<Cinema> {
        return this.prisma.cinema.update({
            where: { idPublic: id },
            data: {
                name: data.name,
                address: data.address
            }
        });
    }

    async delete(id: string): Promise<any> {
        return this.prisma.cinema.delete({ where: { idPublic: id } });
    }
}