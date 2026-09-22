import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ITmdbService } from "../ITmdbService.js";
import {
    TmdbMovieNotFoundException,
    TmdbServiceUnavailableException,
} from "../exceptions/TmdbExceptions.js";
import { ApiException } from "../../common/base/ApiException.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockMovieResponse = {
    id: 27205,
    original_title: "Inception",
    overview: "A thief who steals corporate secrets through dream-sharing technology.",
    poster_path: "/poster.jpg",
    backdrop_path: "/backdrop.jpg",
    runtime: 148,
    release_date: "2010-07-16",
};

describe("ITmdbService", () => {
    let service: ITmdbService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new ITmdbService();
        process.env.TMDB_URL = "https://api.themoviedb.org/3";
        process.env.TMDB_LENGUAGE = "language=es-AR";
        process.env.TMDB_TOKEN = "test-token";
    });

    afterEach(() => {
        delete process.env.TMDB_URL;
        delete process.env.TMDB_LENGUAGE;
        delete process.env.TMDB_TOKEN;
    });

    describe("findMovieById", () => {
        it("should return movie data on successful response", async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(mockMovieResponse),
            });

            const result = await service.findMovieById(27205);

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.themoviedb.org/3/movie/27205?language=es-AR",
                { headers: { Authorization: "Bearer test-token" } }
            );
            expect(result).toEqual(mockMovieResponse);
        });

        it("should build the URL correctly using env variables", async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue({}),
            });

            await service.findMovieById(550);

            const calledUrl = mockFetch.mock.calls[0][0] as string;
            expect(calledUrl).toContain("/movie/550");
            expect(calledUrl).toContain("language=es-AR");
        });

        it("should send Authorization header with Bearer token", async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue({}),
            });

            await service.findMovieById(1);

            const calledOptions = mockFetch.mock.calls[0][1];
            expect(calledOptions.headers.Authorization).toBe("Bearer test-token");
        });

        describe("error handling", () => {
            it("should throw TmdbMovieNotFoundException when TMDB returns 404", async () => {
                mockFetch.mockResolvedValue({
                    ok: false,
                    status: 404,
                    json: vi.fn(),
                });

                await expect(service.findMovieById(99999)).rejects.toThrow(
                    TmdbMovieNotFoundException
                );
            });

            it("should include the movie id in the TmdbMovieNotFoundException message", async () => {
                mockFetch.mockResolvedValue({
                    ok: false,
                    status: 404,
                    json: vi.fn(),
                });

                await expect(service.findMovieById(99999)).rejects.toThrow("99999");
            });

            it("should throw TmdbMovieNotFoundException with NOT_FOUND status", async () => {
                mockFetch.mockResolvedValue({
                    ok: false,
                    status: 404,
                    json: vi.fn(),
                });

                try {
                    await service.findMovieById(99999);
                } catch (e: any) {
                    expect(e.getStatus()).toBe(HttpStatus.NOT_FOUND);
                    expect(e.getResponse().errorCode).toBe("TMDB_MOVIE_NOT_FOUND");
                }
            });

            it("should throw TmdbServiceUnavailableException for non-404 HTTP errors", async () => {
                mockFetch.mockResolvedValue({
                    ok: false,
                    status: 500,
                    json: vi.fn(),
                });

                await expect(service.findMovieById(1)).rejects.toThrow(
                    TmdbServiceUnavailableException
                );
            });

            it("should throw TmdbServiceUnavailableException with SERVICE_UNAVAILABLE status", async () => {
                mockFetch.mockResolvedValue({
                    ok: false,
                    status: 503,
                    json: vi.fn(),
                });

                try {
                    await service.findMovieById(1);
                } catch (e: any) {
                    expect(e.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
                    expect(e.getResponse().errorCode).toBe("TMDB_SERVICE_UNAVAILABLE");
                }
            });

            it("should throw TmdbServiceUnavailableException when fetch throws a network error", async () => {
                mockFetch.mockRejectedValue(new Error("Network error"));

                await expect(service.findMovieById(1)).rejects.toThrow(
                    TmdbServiceUnavailableException
                );
            });

            it("should re-throw TmdbMovieNotFoundException without wrapping it again", async () => {
                mockFetch.mockResolvedValue({
                    ok: false,
                    status: 404,
                    json: vi.fn(),
                });

                const error = await service.findMovieById(1).catch((e) => e);
                expect(error).toBeInstanceOf(TmdbMovieNotFoundException);
                // Should not be double-wrapped in TmdbServiceUnavailableException
                expect(error).not.toBeInstanceOf(TmdbServiceUnavailableException);
            });
        });
    });
});
