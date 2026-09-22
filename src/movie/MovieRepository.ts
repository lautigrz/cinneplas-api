import { ConflictException, Injectable } from "@nestjs/common";
import type { MovieRepository } from "./interfaces/MovieRespository.js";
import type { MovieInput } from "./contracts/movie.schema.js";
import { PrismaService } from "../prisma/PrismaService.js";
import { MovieMapper } from "./mappers/movie.mapper.js";
import { Prisma } from "../generated/prisma/client.js";

@Injectable()
export class IMovieRepository implements MovieRepository {

    constructor(private readonly prisma: PrismaService) { }

    async delete(idPublic: string): Promise<void> {
        try {
            await this.prisma.movie.delete({ where: { idPublic } });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2025") throw new ConflictException();
            }
            throw error;
        }
    }
    async saveKeyS3(idPublic: string, keyPoster: string, keyBackdrop: string): Promise<void> {

        try {
            await this.prisma.movie.update({
                where: { idPublic },
                data: {
                    s3KeyPoster: keyPoster,
                    s3KeyBackdrop: keyBackdrop,
                }
            });
        } catch (error) {

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2025") throw new ConflictException();
            }

            throw error;
        }
    }

    async save(movie: MovieInput, keyPoster: string, keyBackdrop: string): Promise<string> {
        try {
            const newMovie = MovieMapper.toEntity(movie, keyPoster, keyBackdrop);

            const movieEntity = await this.prisma.movie.create({ data: newMovie });
            return movieEntity.idPublic;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") throw new ConflictException();
            }

            throw error;
        }
    }

    async existsByTitle(title: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}