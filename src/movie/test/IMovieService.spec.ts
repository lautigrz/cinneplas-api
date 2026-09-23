import { describe, it, expect, vi, beforeEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { MovieService } from "../IMovieService.js";
import { MOVIE_REPOSITORY } from "../interfaces/MovieRespository.js";
import { TMDB_SERVICE } from "../../tmdb/interfaces/TmdbService.js";
import { AWS_SERVICE } from "../../aws/interfaces/AwsService.js";
import type { MovieInput } from "../contracts/movie.schema.js";

const mockMovieInput: MovieInput = {
    original_title: "Inception",
    overview: "A thief who steals corporate secrets.",
    poster_path: "/poster.jpg",
    backdrop_path: "/backdrop.jpg",
    runtime: 148,
    release_date: "2010-07-16",
};

const mockTmdbService = {
    findMovieById: vi.fn(),
};

const mockMovieRepository = {
    save: vi.fn(),
    delete: vi.fn(),
    saveKeyS3: vi.fn(),
};

const mockAwsService = {
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
};

// Mock sharp module
vi.mock("sharp", () => ({
    default: vi.fn(() => ({
        webp: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from("webp-data")),
    })),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("MovieService", () => {
    let service: MovieService;

    beforeEach(async () => {
        vi.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MovieService,
                { provide: TMDB_SERVICE, useValue: mockTmdbService },
                { provide: MOVIE_REPOSITORY, useValue: mockMovieRepository },
                { provide: AWS_SERVICE, useValue: mockAwsService },
            ],
        }).compile();

        service = module.get<MovieService>(MovieService);
    });

    describe("findMovieById", () => {
        it("should return the movie from tmdbService", async () => {
            mockTmdbService.findMovieById.mockResolvedValue(mockMovieInput);

            const result = await service.findMovieById(12345);

            expect(mockTmdbService.findMovieById).toHaveBeenCalledWith(12345);
            expect(result).toEqual(mockMovieInput);
        });

        it("should propagate errors from tmdbService", async () => {
            mockTmdbService.findMovieById.mockRejectedValue(new Error("TMDB error"));

            await expect(service.findMovieById(12345)).rejects.toThrow("TMDB error");
        });
    });

    describe("createMovie", () => {
        beforeEach(() => {
            process.env.TMDB_URL_IMAGE_PATH = "https://image.tmdb.org/t/p/w500";
            process.env.TMDB_URL_IMAGE_BACKDROP = "https://image.tmdb.org/t/p/w1280";

            // Mock successful fetch response
            mockFetch.mockResolvedValue({
                ok: true,
                arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
            });

            mockAwsService.uploadFile
                .mockResolvedValueOnce("posters/poster-key")
                .mockResolvedValueOnce("backdrops/backdrop-key");

            mockMovieRepository.save.mockResolvedValue("public-movie-id-123");
        });

        it("should download images, convert to webp, upload to S3, and save movie", async () => {
            await service.createMovie(mockMovieInput);

            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenCalledWith(
                `https://image.tmdb.org/t/p/w500/poster.jpg`
            );
            expect(mockFetch).toHaveBeenCalledWith(
                `https://image.tmdb.org/t/p/w1280/backdrop.jpg`
            );
            expect(mockAwsService.uploadFile).toHaveBeenCalledTimes(2);
            expect(mockMovieRepository.save).toHaveBeenCalledWith(
                mockMovieInput,
                "posters/poster-key",
                "backdrops/backdrop-key"
            );
        });

        it("should rollback S3 files when repository.save fails", async () => {
            mockMovieRepository.save.mockRejectedValue(new Error("DB error"));
            mockAwsService.deleteFile.mockResolvedValue(undefined);

            await expect(service.createMovie(mockMovieInput)).rejects.toThrow("DB error");

            // keyPoster and keyBackdrop are assigned to outer let variables before save,
            // so the catch block can clean them up correctly
            expect(mockAwsService.deleteFile).toHaveBeenCalledWith("posters/poster-key");
            expect(mockAwsService.deleteFile).toHaveBeenCalledWith("backdrops/backdrop-key");
        });

        it("should throw and not call repository or S3 if image download fails", async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: "Not Found",
            });

            await expect(service.createMovie(mockMovieInput)).rejects.toThrow(
                "Failed to download image"
            );

            expect(mockMovieRepository.save).not.toHaveBeenCalled();
            expect(mockAwsService.uploadFile).not.toHaveBeenCalled();
            expect(mockMovieRepository.delete).not.toHaveBeenCalled();
        });

    });
});
