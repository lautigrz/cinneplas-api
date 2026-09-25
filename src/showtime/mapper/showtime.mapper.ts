import type { CreateShowtimeInput, ShowTimeMovieDetailOutput } from "../contracts/showtime.schema.js";
import type { Prisma } from "../../generated/prisma/client.js";


type ShowTimeWithMovie = Prisma.ShowTimeGetPayload<{
    select: {
        idPublic: true;
        movie: {
            select: {
                idPublic: true;
                title: true;
                description: true;
                duration: true;
                releaseDate: true;
                s3KeyPoster: true;
            };
        };
        dateTime: true;
    };
}>;

export class ShowtimeMapper {


    static toEntity(input: CreateShowtimeInput, roomId: number, movieId: number): Prisma.ShowTimeCreateInput {
        return {
            dateTime: new Date(input.dateTime),
            room: {
                connect: {
                    id: roomId,
                }
            },
            movie: {
                connect: {
                    id: movieId,
                }
            },
        };
    }

    static toDetailOutput(data: ShowTimeWithMovie[]): ShowTimeMovieDetailOutput {
        const movie = data[0].movie;

        return {
            id: movie.idPublic,
            title: movie.title,
            description: movie.description,
            posterUrl: movie.s3KeyPoster!,
            runtime: movie.duration,
            releaseDate: movie.releaseDate.toISOString(),

            dateTime: data.map((showtime) => ({
                id: showtime.idPublic,
                dateTime: showtime.dateTime.toISOString(),
            })),
        };
    }
}