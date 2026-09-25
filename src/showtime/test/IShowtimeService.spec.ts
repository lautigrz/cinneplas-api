import { describe, it, expect, vi, beforeEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ShowtimeService } from "../IShowtimeService.js";
import { SHOWTIME_REPOSITORY } from "../interfaces/ShowtimeRepository.js";
import { MOVIE_REPOSITORY } from "../../movie/interfaces/MovieRespository.js";
import { CINEMA_ROOM_REPOSITORY } from "../../cinema-room/interfaces/cinema-room.repository.js";
import type { GetListShowTimeMovieResponse, ShowTimeMovieDetailOutput } from "../contracts/showtime.schema.js";

const CINEMA_UUID = "00000000-0000-0000-0000-000000000001";
const MOVIE_UUID  = "00000000-0000-0000-0000-000000000002";
const ROOM_UUID   = "00000000-0000-0000-0000-000000000010";

const createInput = {
    dateTime: "2026-10-01T20:00:00Z",
    cinemaId: CINEMA_UUID,
    roomId:   ROOM_UUID,
    movieId:  MOVIE_UUID,
};

const mockShowtimeRepository = {
    createShowTime:             vi.fn(),
    getAllDateShowtimeForRoom:  vi.fn(),
    getShowtimeMoviesByCinema:  vi.fn(),
    getAllShowtimeMovie:        vi.fn(),
    getMovieWithShowtimes:      vi.fn(),
};

const mockMovieRepository = {
    getIdMovie: vi.fn(),
    save:       vi.fn(),
    delete:     vi.fn(),
    saveKeyS3:  vi.fn(),
};

const mockCinemaRoomRepository = {
    findRoomByIdPublic:    vi.fn(),
    findByIdPublic:        vi.fn(),
    createWithSeats:       vi.fn(),
    updateRoom:            vi.fn(),
    findCinemaByIdPublic:  vi.fn(),
};

const mockListResponse: GetListShowTimeMovieResponse = {
    movies: [{ id: MOVIE_UUID, title: "Inception", posterUrl: "posters/key.webp" }],
    pagination: { page: 1, limit: 10, total: 1 },
};

const mockDetailResponse: ShowTimeMovieDetailOutput = {
    id: MOVIE_UUID,
    title: "Inception",
    description: "A thief...",
    posterUrl: "posters/key.webp",
    runtime: 148,
    releaseDate: "2010-07-16T00:00:00.000Z",
    dateTime: [{ id: "st-1", dateTime: "2026-10-01T20:00:00.000Z" }],
};

describe("IShowtimeService", () => {
    let service: ShowtimeService;

    beforeEach(async () => {
        vi.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShowtimeService,
                { provide: SHOWTIME_REPOSITORY,    useValue: mockShowtimeRepository },
                { provide: MOVIE_REPOSITORY,       useValue: mockMovieRepository },
                { provide: CINEMA_ROOM_REPOSITORY, useValue: mockCinemaRoomRepository },
            ],
        }).compile();

        service = module.get<ShowtimeService>(ShowtimeService);
    });

    describe("createShowTime", () => {
        it("should create a showtime and return its public id", async () => {
            mockCinemaRoomRepository.findRoomByIdPublic.mockResolvedValue({ id: 1 });
            mockMovieRepository.getIdMovie.mockResolvedValue({ id: 42 });
            mockShowtimeRepository.createShowTime.mockResolvedValue("showtime-uuid");

            const result = await service.createShowTime(createInput);

            expect(mockCinemaRoomRepository.findRoomByIdPublic).toHaveBeenCalledWith(
                ROOM_UUID, CINEMA_UUID
            );
            expect(mockMovieRepository.getIdMovie).toHaveBeenCalledWith(MOVIE_UUID);
            expect(mockShowtimeRepository.createShowTime).toHaveBeenCalledWith(createInput, 1, 42);
            expect(result).toBe("showtime-uuid");
        });

        it("should throw NotFoundException when room is not found", async () => {
            mockCinemaRoomRepository.findRoomByIdPublic.mockResolvedValue(null);
            mockMovieRepository.getIdMovie.mockResolvedValue({ id: 42 });

            await expect(service.createShowTime(createInput)).rejects.toThrow(NotFoundException);
        });

        it("should throw NotFoundException when movie is not found", async () => {
            mockCinemaRoomRepository.findRoomByIdPublic.mockResolvedValue({ id: 1 });
            mockMovieRepository.getIdMovie.mockResolvedValue(null);

            await expect(service.createShowTime(createInput)).rejects.toThrow(NotFoundException);
        });

        it("should throw NotFoundException when both room and movie are not found", async () => {
            mockCinemaRoomRepository.findRoomByIdPublic.mockResolvedValue(null);
            mockMovieRepository.getIdMovie.mockResolvedValue(null);

            await expect(service.createShowTime(createInput)).rejects.toThrow(
                "Room or movie not found"
            );
        });

        it("should propagate errors from showtimeRepository.createShowTime", async () => {
            mockCinemaRoomRepository.findRoomByIdPublic.mockResolvedValue({ id: 1 });
            mockMovieRepository.getIdMovie.mockResolvedValue({ id: 42 });
            mockShowtimeRepository.createShowTime.mockRejectedValue(new Error("DB conflict"));

            await expect(service.createShowTime(createInput)).rejects.toThrow("DB conflict");
        });
    });

    describe("getShowtimeMoviesByCinema", () => {
        it("should delegate directly to showtimeRepository.getShowtimeMoviesByCinema", async () => {
            mockShowtimeRepository.getShowtimeMoviesByCinema.mockResolvedValue(mockListResponse);

            const result = await service.getShowtimeMoviesByCinema(CINEMA_UUID, 1, 10);

            expect(mockShowtimeRepository.getShowtimeMoviesByCinema).toHaveBeenCalledWith(
                CINEMA_UUID, 1, 10
            );
            expect(result).toEqual(mockListResponse);
        });

        it("should forward page and limit correctly", async () => {
            mockShowtimeRepository.getShowtimeMoviesByCinema.mockResolvedValue(mockListResponse);

            await service.getShowtimeMoviesByCinema(CINEMA_UUID, 3, 25);

            expect(mockShowtimeRepository.getShowtimeMoviesByCinema).toHaveBeenCalledWith(CINEMA_UUID, 3, 25);
        });

        it("should return empty list when no movies in cinema", async () => {
            const empty: GetListShowTimeMovieResponse = {
                movies: [],
                pagination: { page: 1, limit: 10, total: 0 },
            };
            mockShowtimeRepository.getShowtimeMoviesByCinema.mockResolvedValue(empty);

            const result = await service.getShowtimeMoviesByCinema(CINEMA_UUID, 1, 10);

            expect(result.movies).toHaveLength(0);
        });
    });

    describe("getAllShowtimeMovie", () => {
        it("should delegate to showtimeRepository.getAllShowtimeMovie", async () => {
            mockShowtimeRepository.getAllShowtimeMovie.mockResolvedValue(mockListResponse);

            const result = await service.getAllShowtimeMovie(1, 10);

            expect(mockShowtimeRepository.getAllShowtimeMovie).toHaveBeenCalledWith(1, 10);
            expect(result).toEqual(mockListResponse);
        });
    });

    describe("getMovieWithShowtimes", () => {
        it("should delegate to showtimeRepository.getMovieWithShowtimes", async () => {
            mockShowtimeRepository.getMovieWithShowtimes.mockResolvedValue(mockDetailResponse);

            const result = await service.getMovieWithShowtimes(MOVIE_UUID, CINEMA_UUID);

            expect(mockShowtimeRepository.getMovieWithShowtimes).toHaveBeenCalledWith(
                MOVIE_UUID,
                CINEMA_UUID
            );
            expect(result).toEqual(mockDetailResponse);
        });
    });

    describe("getAllDateShowtimeForRoom", () => {
        const requestInput = { cinemaId: CINEMA_UUID, movieId: MOVIE_UUID };

        it("should return ISO date strings for showtimes", async () => {
            const dates = ["2026-10-01T17:00:00.000Z", "2026-10-02T20:00:00.000Z"];
            mockShowtimeRepository.getAllDateShowtimeForRoom.mockResolvedValue(dates);

            const result = await service.getAllDateShowtimeForRoom(requestInput);

            expect(mockShowtimeRepository.getAllDateShowtimeForRoom).toHaveBeenCalledWith(
                CINEMA_UUID, MOVIE_UUID
            );
            expect(result).toEqual(dates);
        });

        it("should return an empty array when no showtimes exist", async () => {
            mockShowtimeRepository.getAllDateShowtimeForRoom.mockResolvedValue([]);

            const result = await service.getAllDateShowtimeForRoom(requestInput);

            expect(result).toEqual([]);
        });

        it("should propagate errors from showtimeRepository.getAllDateShowtimeForRoom", async () => {
            mockShowtimeRepository.getAllDateShowtimeForRoom.mockRejectedValue(
                new Error("Query failed")
            );

            await expect(service.getAllDateShowtimeForRoom(requestInput)).rejects.toThrow(
                "Query failed"
            );
        });
    });
});
