import { Module } from "@nestjs/common";
import { TmdbModule } from "../tmdb/TmdbModule.js";
import { MovieController } from "./MovieController.js";
import { MOVIE_SERVICE } from "./interfaces/MovieService.js";
import { MovieService } from "./IMovieService.js";
import { MOVIE_REPOSITORY } from "./interfaces/MovieRespository.js";
import { MovieRepository } from "./MovieRepository.js";
import { AwsModule } from "../aws/AwsModule.js";


@Module({
    imports: [
        TmdbModule,
        AwsModule
    ],
    controllers: [
        MovieController
    ],
    providers: [
        { provide: MOVIE_SERVICE, useClass: MovieService },
        { provide: MOVIE_REPOSITORY, useClass: MovieRepository }
    ],
    exports: [
        { provide: MOVIE_REPOSITORY, useClass: MovieRepository }
    ]
})
export class MovieModule { }