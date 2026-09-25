import { CreateShowtimeInput, GetListShowTimeMovieResponse, ShowTimeMovieDetailOutput } from "../contracts/showtime.schema.js";

export interface IShowtimeRepository {
    createShowTime(input: CreateShowtimeInput, roomId: number, movieId: number): Promise<string>;

    getAllDateShowtimeForRoom(cinemaId: string, movieId: string): Promise<string[]>;

    getShowtimeMoviesByCinema(cinemaId: string, page: number, limit: number): Promise<GetListShowTimeMovieResponse>

    getAllShowtimeMovie(page: number, limit: number): Promise<GetListShowTimeMovieResponse>

    getMovieWithShowtimes(idMovie: string, cinemaId: string): Promise<ShowTimeMovieDetailOutput>;
}

export const SHOWTIME_REPOSITORY = Symbol("SHOWTIME_REPOSITORY");