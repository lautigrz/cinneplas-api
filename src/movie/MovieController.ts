import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Res } from "@nestjs/common";
import { MOVIE_SERVICE, type IMovieService } from "./interfaces/MovieService.js";
import { MovieRequestSchema, MovieSchema } from "./contracts/movie.schema.js";

import type { CreateMovieInput } from "./contracts/movie.schema.js";

import type { Response } from "express";
import { Inject } from "@nestjs/common";
import { TMDB_SERVICE, type ITmdbService } from "../tmdb/interfaces/TmdbService.js";

@Controller("api/movies")
export class MovieController {
    constructor(
        @Inject(MOVIE_SERVICE)
        private readonly movieService: IMovieService,
        @Inject(TMDB_SERVICE)
        private readonly tmdbService: ITmdbService
    ) { }

    @Get("tmdb/:id")
    async findMovieById(@Param("id") id: string, @Res() res: Response): Promise<void> {
        try {
            const movieId = MovieRequestSchema.parse({ id: Number(id) });
            const movie = await this.tmdbService.findMovieById(movieId.id);
            res.status(HttpStatus.OK).json(MovieSchema.parse(movie));
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
        }
    }


    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createMovie(@Body() data: CreateMovieInput) {

        const movie = await this.tmdbService.findMovieById(data.id);

        const newMovie = MovieSchema.parse(movie);

        await this.movieService.createMovie(newMovie);


        return {
            message: "Película creada exitosamente",
            movie: newMovie
        }

    }
}