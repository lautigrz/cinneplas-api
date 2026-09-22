import type { MovieInput } from "../contracts/movie.schema.js";

export interface MovieRepository {
    save(movie: MovieInput, s3KeyPoster: string, s3KeyBackdrop: string): Promise<string>;
    //existsByTitle(title: string): Promise<boolean>;
    saveKeyS3(idPublic: string, keyPoster: string, keyBackdrop: string): Promise<void>;
    delete(idPublic: string): Promise<void>;
}

export const MOVIE_REPOSITORY = Symbol("MOVIE_REPOSITORY");