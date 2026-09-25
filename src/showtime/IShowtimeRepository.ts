import { ConflictException, NotFoundException } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client.js";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/PrismaService.js";
import type { CreateShowtimeInput, GetListShowTimeMovieResponse, ShowTimeMovieDetailOutput } from "./contracts/showtime.schema.js";
import type { IShowtimeRepository as IShowtimeRepositoryInterface } from "./interfaces/ShowtimeRepository.js";
import { ShowtimeMapper } from "./mapper/showtime.mapper.js";

@Injectable()
export class ShowtimeRepository implements IShowtimeRepositoryInterface {

    constructor(private readonly prisma: PrismaService) { }


    async getMovieWithShowtimes(idMovie: string, cinemaId: string): Promise<ShowTimeMovieDetailOutput> {

        const where = {
            movie: {
                idPublic: idMovie,
            },
            room: {
                cinema: {
                    idPublic: cinemaId,
                },
            },
            dateTime: {
                gte: new Date(),
            },
        }

        const movieAndShowtimes = await this.prisma.showTime.findMany({
            where,
            select: {
                idPublic: true,
                movie: {
                    select: {
                        idPublic: true,
                        title: true,
                        description: true,
                        duration: true,
                        releaseDate: true,
                        s3KeyPoster: true,
                    }
                },
                dateTime: true,
            },
            orderBy: {
                dateTime: "asc",
            },
        })

        if (movieAndShowtimes.length === 0) {
            throw new NotFoundException("Movie not found");
        }


        return ShowtimeMapper.toDetailOutput(movieAndShowtimes);

    }


    async getAllShowtimeMovie(page: number, limit: number): Promise<GetListShowTimeMovieResponse> {
        const where = {
            dateTime: {
                gte: new Date(),
            },
        };

        const [showtimes, total] = await Promise.all([
            this.prisma.showTime.findMany({
                where,
                select: {
                    movie: {
                        select: {
                            idPublic: true,
                            title: true,
                            s3KeyPoster: true,
                        },
                    },
                },
                distinct: ["movieId"],
                skip: (page - 1) * limit,
                take: limit,
            }),

            this.prisma.showTime.groupBy({
                by: ["movieId"],
                where
            })
        ]);

        return {
            movies: showtimes.map(({ movie }) => ({
                id: movie.idPublic,
                title: movie.title,
                posterUrl: movie.s3KeyPoster!,
            })),
            pagination: {
                page,
                limit,
                total: total.length,
            },
        };
    }


    async getShowtimeMoviesByCinema(cinemaId: string, page: number, limit: number): Promise<GetListShowTimeMovieResponse> {

        const where = {
            room: {
                cinema: {
                    idPublic: cinemaId,
                },
            },
            dateTime: {
                gte: new Date(),
            },
        };


        const [showtimes, total] = await Promise.all([
            this.prisma.showTime.findMany({
                where,
                select: {
                    movie: {
                        select: {
                            idPublic: true,
                            title: true,
                            s3KeyPoster: true,
                        },
                    },
                },
                distinct: ["movieId"],
                skip: (page - 1) * limit,
                take: limit,
            }),

            this.prisma.showTime.count({
                where,
            }),
        ]);

        return {
            movies: showtimes.map(({ movie }) => ({
                id: movie.idPublic,
                title: movie.title,
                posterUrl: movie.s3KeyPoster!,
            })),
            pagination: {
                page,
                limit,
                total,
            },
        };
    }

    async getAllDateShowtimeForRoom(cinemaId: string, movieId: string): Promise<string[]> {
        const showtimes = await this.prisma.showTime.findMany({
            where: {
                movie: {
                    idPublic: movieId
                },
                room: {
                    cinema: {
                        idPublic: cinemaId
                    }
                }
            },
            select: {
                dateTime: true,
            },
        });

        return showtimes.map((s) => s.dateTime.toISOString());
    }

    async createShowTime(input: CreateShowtimeInput, roomId: number, movieId: number): Promise<string> {

        const showtime = ShowtimeMapper.toEntity(input, roomId, movieId);
        try {
            const showtimeEntity = await this.prisma.showTime.create({ data: showtime });
            return showtimeEntity.idPublic;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") throw new ConflictException();
            }

            throw error;
        }


    }




}