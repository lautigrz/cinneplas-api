import { Inject, NotFoundException } from "@nestjs/common";
import type { CreateShowtimeInput, GetListShowTimeMovieResponse, ShowTimeMovieDetailOutput, ShowtimeRequestInput } from "./contracts/showtime.schema.js";
import { SHOWTIME_REPOSITORY, type IShowtimeRepository } from "./interfaces/ShowtimeRepository.js";
import { MOVIE_REPOSITORY, type IMovieRepository } from "../movie/interfaces/MovieRespository.js";
import { CINEMA_ROOM_REPOSITORY, type CinemaRoomRepository } from "../cinema-room/interfaces/cinema-room.repository.js";
import { IShowtimeService } from "./interfaces/ShowtimeService.js";



export class ShowtimeService implements IShowtimeService {

    constructor(
        @Inject(SHOWTIME_REPOSITORY)
        private readonly showtimeRepository: IShowtimeRepository,
        @Inject(MOVIE_REPOSITORY)
        private readonly movieRepository: IMovieRepository,
        @Inject(CINEMA_ROOM_REPOSITORY)
        private readonly cinemaRoomRepository: CinemaRoomRepository,
    ) { }
    async getMovieWithShowtimes(idMovie: string, cinemaId: string): Promise<ShowTimeMovieDetailOutput> {
        return this.showtimeRepository.getMovieWithShowtimes(idMovie, cinemaId);
    }


    async getAllShowtimeMovie(page: number, limit: number): Promise<GetListShowTimeMovieResponse> {
        return this.showtimeRepository.getAllShowtimeMovie(page, limit);
    }


    async getShowtimeMoviesByCinema(cinemaId: string, page: number, limit: number): Promise<GetListShowTimeMovieResponse> {
        return this.showtimeRepository.getShowtimeMoviesByCinema(cinemaId, page, limit);
    }


    async getAllDateShowtimeForRoom(input: ShowtimeRequestInput): Promise<string[]> {


        return this.showtimeRepository.getAllDateShowtimeForRoom(input.cinemaId, input.movieId);
    }


    async createShowTime(input: CreateShowtimeInput): Promise<string> {

        const room = await this.cinemaRoomRepository.findRoomByIdPublic(input.roomId, input.cinemaId);

        const movie = await this.movieRepository.getIdMovie(input.movieId);

        if (!room || !movie) throw new NotFoundException("Room or movie not found");

        const newShowtime = await this.showtimeRepository.createShowTime(input, room.id, movie.id);

        return newShowtime;
    }


}