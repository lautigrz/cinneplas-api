import { describe, it, expect, vi, beforeEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ShowtimeController } from "../ShowtimeController.js";
import { SHOWTIME_SERVICE } from "../interfaces/ShowtimeService.js";
import type { GetListShowTimeMovieResponse, ShowTimeMovieDetailOutput } from "../contracts/showtime.schema.js";

const CINEMA_UUID = "00000000-0000-0000-0000-000000000001";
const MOVIE_UUID  = "00000000-0000-0000-0000-000000000002";
const ROOM_UUID   = "00000000-0000-0000-0000-000000000010";

const mockShowtimeService = {
    createShowTime:             vi.fn(),
    getAllShowtimeMovie:        vi.fn(),
    getShowtimeMoviesByCinema:  vi.fn(),
    getMovieWithShowtimes:      vi.fn(),
};

const mockListResponse: GetListShowTimeMovieResponse = {
    movies: [
        { id: MOVIE_UUID, title: "Inception", posterUrl: "posters/key.webp" },
    ],
    pagination: { page: 1, limit: 10, total: 1 },
};

const mockDetailResponse: ShowTimeMovieDetailOutput = {
    id: MOVIE_UUID,
    title: "Inception",
    description: "A thief...",
    posterUrl: "posters/key.webp",
    runtime: 148,
    releaseDate: "2010-07-16T00:00:00.000Z",
    dateTime: [
        { id: "showtime-uuid-1", dateTime: "2026-10-01T14:00:00.000Z" }
    ],
};

describe("ShowtimeController", () => {
    let controller: ShowtimeController;

    beforeEach(async () => {
        vi.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShowtimeController],
            providers: [{ provide: SHOWTIME_SERVICE, useValue: mockShowtimeService }],
        }).compile();

        controller = module.get<ShowtimeController>(ShowtimeController);
    });

    describe("createShowtime (POST /api/showtimes)", () => {
        const input = {
            dateTime: "2026-10-01T20:00:00Z",
            cinemaId: CINEMA_UUID,
            roomId:   ROOM_UUID,
            movieId:  MOVIE_UUID,
        };

        it("should call showtimeService.createShowTime and return the new id", async () => {
            mockShowtimeService.createShowTime.mockResolvedValue("new-showtime-uuid");

            const result = await controller.createShowtime(input);

            expect(mockShowtimeService.createShowTime).toHaveBeenCalledWith(input);
            expect(result).toBe("new-showtime-uuid");
        });

        it("should propagate NotFoundException when room or movie not found", async () => {
            mockShowtimeService.createShowTime.mockRejectedValue(
                new NotFoundException("Room or movie not found")
            );

            await expect(controller.createShowtime(input)).rejects.toThrow(NotFoundException);
        });

        it("should propagate generic errors from the service", async () => {
            mockShowtimeService.createShowTime.mockRejectedValue(new Error("DB error"));

            await expect(controller.createShowtime(input)).rejects.toThrow("DB error");
        });
    });

    describe("getMoviesWithShowtimes (GET /api/showtimes/movies)", () => {
        it("should call getShowtimeMoviesByCinema when cinemaId is provided", async () => {
            mockShowtimeService.getShowtimeMoviesByCinema.mockResolvedValue(mockListResponse);

            const result = await controller.getMoviesWithShowtimes({
                cinemaId: CINEMA_UUID,
                page: 1,
                limit: 10,
            });

            expect(mockShowtimeService.getShowtimeMoviesByCinema).toHaveBeenCalledWith(
                CINEMA_UUID, 1, 10
            );
            expect(result).toEqual(mockListResponse);
        });

        it("should call getAllShowtimeMovie when cinemaId is not provided", async () => {
            mockShowtimeService.getAllShowtimeMovie.mockResolvedValue(mockListResponse);

            const result = await controller.getMoviesWithShowtimes({
                page: 1,
                limit: 10,
            });

            expect(mockShowtimeService.getAllShowtimeMovie).toHaveBeenCalledWith(1, 10);
            expect(result).toEqual(mockListResponse);
        });

        it("should forward custom page and limit to getShowtimeMoviesByCinema", async () => {
            mockShowtimeService.getShowtimeMoviesByCinema.mockResolvedValue(mockListResponse);

            await controller.getMoviesWithShowtimes({
                cinemaId: CINEMA_UUID,
                page: 3,
                limit: 5,
            });

            expect(mockShowtimeService.getShowtimeMoviesByCinema).toHaveBeenCalledWith(CINEMA_UUID, 3, 5);
        });

        it("should return empty movies list when cinema has no showtimes", async () => {
            const empty: GetListShowTimeMovieResponse = {
                movies: [],
                pagination: { page: 1, limit: 10, total: 0 },
            };
            mockShowtimeService.getShowtimeMoviesByCinema.mockResolvedValue(empty);

            const result = await controller.getMoviesWithShowtimes({
                cinemaId: CINEMA_UUID,
                page: 1,
                limit: 10,
            });

            expect(result.movies).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
        });
    });

    describe("getMovieWithShowtimes (GET /api/showtimes/movies/:movieId)", () => {
        it("should call showtimeService.getMovieWithShowtimes and return movie details with showtimes", async () => {
            mockShowtimeService.getMovieWithShowtimes.mockResolvedValue(mockDetailResponse);

            const result = await controller.getMovieWithShowtimes(MOVIE_UUID, CINEMA_UUID);

            expect(mockShowtimeService.getMovieWithShowtimes).toHaveBeenCalledWith(
                MOVIE_UUID,
                CINEMA_UUID
            );
            expect(result).toEqual(mockDetailResponse);
        });

        it("should propagate NotFoundException when movie has no showtimes in cinema", async () => {
            mockShowtimeService.getMovieWithShowtimes.mockRejectedValue(
                new NotFoundException("Movie not found")
            );

            await expect(
                controller.getMovieWithShowtimes(MOVIE_UUID, CINEMA_UUID)
            ).rejects.toThrow(NotFoundException);
        });
    });
});
