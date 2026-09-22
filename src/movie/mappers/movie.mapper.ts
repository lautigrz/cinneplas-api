import type { MovieInput } from "../contracts/movie.schema.js";
import { Prisma } from "../../generated/prisma/client.js";

export class MovieMapper {

    static toEntity(
        data: MovieInput,
        keyPoster: string,
        keyBackdrop: string
    ): Prisma.MovieCreateInput {
        return {
            title: data.original_title,
            s3KeyPoster: keyPoster,
            s3KeyBackdrop: keyBackdrop,
            description: data.overview,
            duration: data.runtime,
            releaseDate: new Date(data.release_date),
        };
    }
}