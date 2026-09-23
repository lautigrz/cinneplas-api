import { Movie } from "../../generated/prisma/client.js";
import type { MovieInput, MoviePoster } from "../contracts/movie.schema.js";

export interface IMovieRepository {
    save(movie: MovieInput, s3KeyPoster: string, s3KeyBackdrop: string): Promise<string>;
    //existsByTitle(title: string): Promise<boolean>;
    saveKeyS3(idPublic: string, keyPoster: string, keyBackdrop: string): Promise<void>;
    delete(idPublic: string): Promise<void>;

    getIdMovie(idPublic: string): Promise<{ id: number; } | null>

}

export const MOVIE_REPOSITORY = Symbol("MOVIE_REPOSITORY");