import { AWS_SERVICE, type AwsService } from "../aws/interfaces/AwsService.js";
import { TMDB_SERVICE } from "../tmdb/interfaces/TmdbService.js";
import type { TmdbService } from "../tmdb/interfaces/TmdbService.js";
import { MovieInput } from "./contracts/movie.schema.js";
import { MOVIE_REPOSITORY, type MovieRepository } from "./interfaces/MovieRespository.js";
import type { MovieService } from "./interfaces/MovieService.js";
import { Inject, Injectable } from "@nestjs/common";
import sharp from "sharp";

@Injectable()
export class IMovieService implements MovieService {
    constructor(
        @Inject(TMDB_SERVICE)
        private readonly tmdbService: TmdbService,
        @Inject(MOVIE_REPOSITORY)
        private readonly movieRepository: MovieRepository,
        @Inject(AWS_SERVICE)
        private readonly awsService: AwsService
    ) { }

    async createMovie(data: MovieInput): Promise<void> {
        let movieId: string | undefined;
        let keyPoster: string | undefined;
        let keyBackdrop: string | undefined;

        try {

            const imagePosterPath =
                `${process.env.TMDB_URL_IMAGE_PATH}${data.poster_path}`;

            const imageBackdropPath = `${process.env.TMDB_URL_IMAGE_BACKDROP}${data.backdrop_path}`;

            const [posterBuffer, backdropBuffer] = await Promise.all([
                this.downloadImage(imagePosterPath),
                this.downloadImage(imageBackdropPath),
            ]);


            const imageBuffer = Buffer.from(posterBuffer);
            const imageBackdropBuffer = Buffer.from(backdropBuffer);


            const [posterWebp, backdropWebp] = await Promise.all([
                sharp(imageBuffer)
                    .webp({ quality: 85 })
                    .toBuffer(),

                sharp(imageBackdropBuffer)
                    .webp({ quality: 85 })
                    .toBuffer(),
            ]);

            [keyPoster, keyBackdrop] = await Promise.all([
                this.awsService.uploadFile(posterWebp, "posters"),
                this.awsService.uploadFile(backdropWebp, "backdrops"),
            ]);

            movieId = await this.movieRepository.save(data, keyPoster, keyBackdrop);
            return;
        } catch (error) {
            //rollback
            if (movieId) await this.movieRepository.delete(movieId);

            if (keyPoster) await this.awsService.deleteFile(keyPoster);
            if (keyBackdrop) await this.awsService.deleteFile(keyBackdrop);

            console.error("Error al buscar la película en MovieService:", error);
            throw error;
        }
    }


    async findMovieById(id: number): Promise<any> {
        try {
            const movie = await this.tmdbService.findMovieById(id);
            return movie;
        } catch (error) {
            console.error("Error al buscar la película en MovieService:", error);
            throw error;
        }
    }

    private async downloadImage(url: string): Promise<Buffer> {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Failed to download image: ${response.status} ${response.statusText}`
            );
        }

        return Buffer.from(await response.arrayBuffer());
    }
}