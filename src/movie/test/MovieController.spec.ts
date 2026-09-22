import { describe, it, expect, vi, beforeEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus } from "@nestjs/common";
import { MovieController } from "../MovieController.js";
import { MOVIE_SERVICE } from "../interfaces/MovieService.js";
import { TMDB_SERVICE } from "../../tmdb/interfaces/TmdbService.js";

const mockMovieData = {
    original_title: "Inception",
    overview: "A thief who steals corporate secrets through dream-sharing technology.",
    poster_path: "/poster.jpg",
    backdrop_path: "/backdrop.jpg",
    runtime: 148,
    release_date: "2010-07-16",
};

const mockMovieService = {
    createMovie: vi.fn(),
    findMovieById: vi.fn(),
};

const mockTmdbService = {
    findMovieById: vi.fn(),
};

describe("MovieController", () => {
    let controller: MovieController;

    beforeEach(async () => {
        vi.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [MovieController],
            providers: [
                { provide: MOVIE_SERVICE, useValue: mockMovieService },
                { provide: TMDB_SERVICE, useValue: mockTmdbService },
            ],
        }).compile();

        controller = module.get<MovieController>(MovieController);
    });

    describe("findMovieById", () => {
        it("should return movie data with status 200 when movie is found", async () => {
            mockTmdbService.findMovieById.mockResolvedValue(mockMovieData);

            const mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            } as any;

            await controller.findMovieById("12345", mockRes);

            expect(mockTmdbService.findMovieById).toHaveBeenCalledWith(12345);
            expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockRes.json).toHaveBeenCalledWith(mockMovieData);
        });

        it("should return 400 when id is not a valid number (schema parse fails)", async () => {
            const mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            } as any;

            // NaN will fail the z.number() schema
            await controller.findMovieById("not-a-number", mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.any(String) })
            );
        });

        it("should return 400 when tmdbService throws an error", async () => {
            mockTmdbService.findMovieById.mockRejectedValue(new Error("TMDB API error"));

            const mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            } as any;

            await controller.findMovieById("12345", mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "TMDB API error" });
        });

        it("should return 400 when movie data fails MovieSchema validation", async () => {
            mockTmdbService.findMovieById.mockResolvedValue({
                original_title: "",  // fails min(1)
                overview: "Some overview",
                poster_path: "/poster.jpg",
                backdrop_path: "/backdrop.jpg",
                runtime: 120,
                release_date: "2020-01-01",
            });

            const mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            } as any;

            await controller.findMovieById("12345", mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        });
    });

    describe("createMovie", () => {
        it("should create a movie and return success message", async () => {
            mockTmdbService.findMovieById.mockResolvedValue(mockMovieData);
            mockMovieService.createMovie.mockResolvedValue(undefined);

            const result = await controller.createMovie({ id: 12345 });

            expect(mockTmdbService.findMovieById).toHaveBeenCalledWith(12345);
            expect(mockMovieService.createMovie).toHaveBeenCalledWith(mockMovieData);
            expect(result).toEqual({
                message: "Película creada exitosamente",
                movie: mockMovieData,
            });
        });

        it("should propagate error if tmdbService.findMovieById throws", async () => {
            mockTmdbService.findMovieById.mockRejectedValue(new Error("Not found"));

            await expect(controller.createMovie({ id: 99999 })).rejects.toThrow("Not found");
        });

        it("should propagate error if movieService.createMovie throws", async () => {
            mockTmdbService.findMovieById.mockResolvedValue(mockMovieData);
            mockMovieService.createMovie.mockRejectedValue(new Error("DB error"));

            await expect(controller.createMovie({ id: 12345 })).rejects.toThrow("DB error");
        });
    });
});
