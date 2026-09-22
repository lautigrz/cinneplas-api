import { Module } from "@nestjs/common";
import { TmdbModule } from "../tmdb/TmdbModule.js";
import { MovieController } from "./MovieController.js";
import { MOVIE_SERVICE } from "./interfaces/MovieService.js";
import { IMovieService } from "./IMovieService.js";
import { MOVIE_REPOSITORY } from "./interfaces/MovieRespository.js";
import { IMovieRepository } from "./MovieRepository.js";
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
        { provide: MOVIE_SERVICE, useClass: IMovieService },
        { provide: MOVIE_REPOSITORY, useClass: IMovieRepository }
    ],
})
export class MovieModule { }