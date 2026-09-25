import { CreateShowtimeInput, GetListShowTimeMovieResponse, ShowTimeMovieDetailOutput } from "../contracts/showtime.schema.js";
import { ShowtimeRequestInput } from "../contracts/showtime.schema.js";

export interface IShowtimeService {
    createShowTime(input: CreateShowtimeInput): Promise<string>;

    getAllDateShowtimeForRoom(input: ShowtimeRequestInput): Promise<string[]>;

    getShowtimeMoviesByCinema(cinemaId: string, page: number, limit: number): Promise<GetListShowTimeMovieResponse>

    getAllShowtimeMovie(page: number, limit: number): Promise<GetListShowTimeMovieResponse>

    getMovieWithShowtimes(idMovie: string, cinemaId: string): Promise<ShowTimeMovieDetailOutput>;
}

export const SHOWTIME_SERVICE = Symbol("SHOWTIME_SERVICE");