import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query } from "@nestjs/common";

import { showtimeListRequest, type CreateShowtimeInput, type ShowtimeListRequestInput, type ShowtimeRequestInput } from "./contracts/showtime.schema.js";
import { ZodValidationPipe } from "nestjs-zod";
import { type IShowtimeService, SHOWTIME_SERVICE } from "./interfaces/ShowtimeService.js";

@Controller("/api/showtimes")
export class ShowtimeController {


    constructor(
        @Inject(SHOWTIME_SERVICE)
        private readonly showtimeService: IShowtimeService
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createShowtime(@Body() input: CreateShowtimeInput) {
        return this.showtimeService.createShowTime(input);
    }

    @Get("/movies")
    @HttpCode(HttpStatus.OK)
    async getMoviesWithShowtimes(@Query(new ZodValidationPipe(showtimeListRequest)) input: ShowtimeListRequestInput) {

        if (!input.cinemaId) {

            return this.showtimeService.getAllShowtimeMovie(input.page, input.limit);
        }

        return this.showtimeService.getShowtimeMoviesByCinema(input.cinemaId, input.page, input.limit);
    }

    @Get("/movies/:movieId")
    async getMovieWithShowtimes(
        @Param("movieId") movieId: string,
        @Query("cinemaId") cinemaId: string,
    ) {
        return this.showtimeService.getMovieWithShowtimes(
            movieId,
            cinemaId
        );
    }
}