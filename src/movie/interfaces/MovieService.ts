import { CreateMovieInput, MovieInput } from "../contracts/movie.schema.js";

export interface MovieService {
    findMovieById(id: number): Promise<any>;
    createMovie(data: MovieInput): Promise<void>;
}

export const MOVIE_SERVICE = Symbol("MOVIE_SERVICE");