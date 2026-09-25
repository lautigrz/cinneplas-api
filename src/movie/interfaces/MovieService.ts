import { CreateMovieInput, ListMoviePostersRequestInput, MovieInput, MoviePoster } from "../contracts/movie.schema.js";

export interface IMovieService {
    findMovieById(id: number): Promise<any>;
    createMovie(data: MovieInput): Promise<void>;
    getListMoviePosters(input: ListMoviePostersRequestInput): Promise<MoviePoster[]>;
}

export const MOVIE_SERVICE = Symbol("MOVIE_SERVICE");