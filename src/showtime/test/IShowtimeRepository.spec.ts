import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { ShowtimeRepository } from "../IShowtimeRepository.js";
import { Prisma } from "../../generated/prisma/client.js";
import type { GetListShowTimeMovieResponse } from "../contracts/showtime.schema.js";

const CINEMA_UUID = "00000000-0000-0000-0000-000000000001";
const MOVIE_UUID  = "00000000-0000-0000-0000-000000000002";

const createInput = {
    dateTime: "2026-10-01T20:00:00Z",
    cinemaId: CINEMA_UUID,
    roomId:   "00000000-0000-0000-0000-000000000010",
    movieId:  MOVIE_UUID,
};

const mockPrismaService = {
    showTime: {
        create:   vi.fn(),
        findMany: vi.fn(),
        count:    vi.fn(),
        groupBy:  vi.fn(),
    },
};

describe("ShowtimeRepository", () => {
    let repository: ShowtimeRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        repository = new ShowtimeRepository(mockPrismaService as any);
    });

    describe("createShowTime", () => {
        it("should create a showtime and return its public id", async () => {
            mockPrismaService.showTime.create.mockResolvedValue({ idPublic: "st-uuid-123" });

            const result = await repository.createShowTime(createInput, 1, 42);

            expect(mockPrismaService.showTime.create).toHaveBeenCalledOnce();
            expect(result).toBe("st-uuid-123");
        });

        it("should pass mapped entity with correct dateTime to prisma.create", async () => {
            mockPrismaService.showTime.create.mockResolvedValue({ idPublic: "st-uuid" });

            await repository.createShowTime(createInput, 5, 10);

            const callArg = mockPrismaService.showTime.create.mock.calls[0][0];
            expect(callArg.data.dateTime).toEqual(new Date("2026-10-01T20:00:00Z"));
            expect(callArg.data.room.connect.id).toBe(5);
            expect(callArg.data.movie.connect.id).toBe(10);
        });

        it("should throw ConflictException on Prisma P2002 unique constraint error", async () => {
            const prismaError = new Prisma.PrismaClientKnownRequestError(
                "Unique constraint failed",
                { code: "P2002", clientVersion: "7.0.0", meta: {} }
            );
            mockPrismaService.showTime.create.mockRejectedValue(prismaError);

            await expect(repository.createShowTime(createInput, 1, 42)).rejects.toThrow(
                ConflictException
            );
        });

        it("should rethrow unknown Prisma errors", async () => {
            const unknownError = new Error("DB connection lost");
            mockPrismaService.showTime.create.mockRejectedValue(unknownError);

            await expect(repository.createShowTime(createInput, 1, 42)).rejects.toThrow(
                "DB connection lost"
            );
        });
    });

    describe("getMovieWithShowtimes", () => {
        it("should return movie details with showtimes", async () => {
            const fakeMovieAndShowtimes = [
                {
                    idPublic: "showtime-uuid-1",
                    dateTime: new Date("2026-10-01T14:00:00.000Z"),
                    movie: {
                        idPublic: MOVIE_UUID,
                        title: "Inception",
                        description: "A dream thief...",
                        duration: 148,
                        releaseDate: new Date("2010-07-16T00:00:00.000Z"),
                        s3KeyPoster: "posters/inception.webp",
                    },
                },
            ];
            mockPrismaService.showTime.findMany.mockResolvedValue(fakeMovieAndShowtimes);

            const result = await repository.getMovieWithShowtimes(MOVIE_UUID, CINEMA_UUID);

            expect(mockPrismaService.showTime.findMany).toHaveBeenCalledWith({
                where: {
                    movie: { idPublic: MOVIE_UUID },
                    room: { cinema: { idPublic: CINEMA_UUID } },
                    dateTime: { gte: expect.any(Date) },
                },
                select: {
                    idPublic: true,
                    movie: {
                        select: {
                            idPublic: true,
                            title: true,
                            description: true,
                            duration: true,
                            releaseDate: true,
                            s3KeyPoster: true,
                        },
                    },
                    dateTime: true,
                },
                orderBy: {
                    dateTime: "asc",
                },
            });
            expect(result.id).toBe(MOVIE_UUID);
            expect(result.title).toBe("Inception");
            expect(result.dateTime).toHaveLength(1);
            expect(result.dateTime[0].id).toBe("showtime-uuid-1");
        });

        it("should throw NotFoundException when no showtimes are found", async () => {
            mockPrismaService.showTime.findMany.mockResolvedValue([]);

            await expect(
                repository.getMovieWithShowtimes(MOVIE_UUID, CINEMA_UUID)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe("getAllShowtimeMovie", () => {
        it("should return paginated movies across all cinemas", async () => {
            const fakeShowtimes = [
                { movie: { idPublic: MOVIE_UUID, title: "Inception", s3KeyPoster: "posters/key.webp" } },
            ];
            mockPrismaService.showTime.findMany.mockResolvedValue(fakeShowtimes);
            mockPrismaService.showTime.groupBy.mockResolvedValue([{ movieId: 1 }]);

            const result = await repository.getAllShowtimeMovie(1, 10);

            expect(result.movies).toHaveLength(1);
            expect(result.movies[0]).toEqual({
                id: MOVIE_UUID,
                title: "Inception",
                posterUrl: "posters/key.webp",
            });
            expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1 });
        });

        it("should calculate correct skip and take for pagination", async () => {
            mockPrismaService.showTime.findMany.mockResolvedValue([]);
            mockPrismaService.showTime.groupBy.mockResolvedValue([]);

            await repository.getAllShowtimeMovie(2, 5);

            const findManyCall = mockPrismaService.showTime.findMany.mock.calls[0][0];
            expect(findManyCall.skip).toBe(5);
            expect(findManyCall.take).toBe(5);
        });
    });

    describe("getShowtimeMoviesByCinema", () => {
        it("should return paginated movies with correct structure for a cinema", async () => {
            const fakeShowtimes = [
                { movie: { idPublic: MOVIE_UUID, title: "Inception", s3KeyPoster: "posters/key.webp" } },
            ];
            mockPrismaService.showTime.findMany.mockResolvedValue(fakeShowtimes);
            mockPrismaService.showTime.count.mockResolvedValue(1);

            const result: GetListShowTimeMovieResponse = await repository.getShowtimeMoviesByCinema(
                CINEMA_UUID, 1, 10
            );

            expect(result.movies).toHaveLength(1);
            expect(result.movies[0]).toEqual({
                id:        MOVIE_UUID,
                title:     "Inception",
                posterUrl: "posters/key.webp",
            });
            expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1 });
        });

        it("should apply correct skip/take for pagination", async () => {
            mockPrismaService.showTime.findMany.mockResolvedValue([]);
            mockPrismaService.showTime.count.mockResolvedValue(0);

            await repository.getShowtimeMoviesByCinema(CINEMA_UUID, 3, 5);

            const findManyCall = mockPrismaService.showTime.findMany.mock.calls[0][0];
            expect(findManyCall.skip).toBe(10); // (3-1) * 5
            expect(findManyCall.take).toBe(5);
        });

        it("should filter by cinemaId via nested room.cinema.idPublic", async () => {
            mockPrismaService.showTime.findMany.mockResolvedValue([]);
            mockPrismaService.showTime.count.mockResolvedValue(0);

            await repository.getShowtimeMoviesByCinema(CINEMA_UUID, 1, 10);

            const findManyCall = mockPrismaService.showTime.findMany.mock.calls[0][0];
            expect(findManyCall.where.room.cinema.idPublic).toBe(CINEMA_UUID);
        });

        it("should only include future showtimes (dateTime >= now)", async () => {
            mockPrismaService.showTime.findMany.mockResolvedValue([]);
            mockPrismaService.showTime.count.mockResolvedValue(0);

            const before = new Date();
            await repository.getShowtimeMoviesByCinema(CINEMA_UUID, 1, 10);
            const after = new Date();

            const findManyCall = mockPrismaService.showTime.findMany.mock.calls[0][0];
            const gteDate: Date = findManyCall.where.dateTime.gte;
            expect(gteDate.getTime()).toBeGreaterThanOrEqual(before.getTime() - 100);
            expect(gteDate.getTime()).toBeLessThanOrEqual(after.getTime() + 100);
        });

        it("should return empty movies and total 0 when no showtimes exist", async () => {
            mockPrismaService.showTime.findMany.mockResolvedValue([]);
            mockPrismaService.showTime.count.mockResolvedValue(0);

            const result = await repository.getShowtimeMoviesByCinema(CINEMA_UUID, 1, 10);

            expect(result.movies).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
        });

        it("should run findMany and count in parallel (both called once)", async () => {
            mockPrismaService.showTime.findMany.mockResolvedValue([]);
            mockPrismaService.showTime.count.mockResolvedValue(0);

            await repository.getShowtimeMoviesByCinema(CINEMA_UUID, 1, 10);

            expect(mockPrismaService.showTime.findMany).toHaveBeenCalledOnce();
            expect(mockPrismaService.showTime.count).toHaveBeenCalledOnce();
        });
    });

    describe("getAllDateShowtimeForRoom", () => {
        it("should return ISO strings of showtime dates", async () => {
            const date1 = new Date("2026-10-01T17:00:00Z");
            const date2 = new Date("2026-10-02T20:00:00Z");
            mockPrismaService.showTime.findMany.mockResolvedValue([
                { dateTime: date1 },
                { dateTime: date2 },
            ]);

            const result = await repository.getAllDateShowtimeForRoom(CINEMA_UUID, MOVIE_UUID);

            expect(result).toEqual([date1.toISOString(), date2.toISOString()]);
        });

        it("should query with correct nested where clause", async () => {
            mockPrismaService.showTime.findMany.mockResolvedValue([]);

            await repository.getAllDateShowtimeForRoom(CINEMA_UUID, MOVIE_UUID);

            expect(mockPrismaService.showTime.findMany).toHaveBeenCalledWith({
                where: {
                    movie: { idPublic: MOVIE_UUID },
                    room:  { cinema: { idPublic: CINEMA_UUID } },
                },
                select: { dateTime: true },
            });
        });

        it("should return empty array when no showtimes are found", async () => {
            mockPrismaService.showTime.findMany.mockResolvedValue([]);

            const result = await repository.getAllDateShowtimeForRoom(CINEMA_UUID, MOVIE_UUID);

            expect(result).toEqual([]);
        });
    });
});
