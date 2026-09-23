import { describe, it, expect } from "vitest";
import { ShowtimeMapper } from "../mapper/showtime.mapper.js";

const CINEMA_UUID = "00000000-0000-0000-0000-000000000001";
const MOVIE_UUID  = "00000000-0000-0000-0000-000000000002";
const ROOM_UUID   = "00000000-0000-0000-0000-000000000010";

const createInput = {
    dateTime: "2026-10-01T20:00:00Z",
    cinemaId: CINEMA_UUID,
    roomId:   ROOM_UUID,
    movieId:  MOVIE_UUID,
};

describe("ShowtimeMapper", () => {
    describe("toEntity", () => {
        it("should convert dateTime string to a Date object", () => {
            const result = ShowtimeMapper.toEntity(createInput, 1, 42);

            expect(result.dateTime).toBeInstanceOf(Date);
            expect((result.dateTime as Date).toISOString()).toBe("2026-10-01T20:00:00.000Z");
        });

        it("should connect room by the provided numeric roomId", () => {
            const result = ShowtimeMapper.toEntity(createInput, 7, 42);

            expect((result.room as any).connect.id).toBe(7);
        });

        it("should connect movie by the provided numeric movieId", () => {
            const result = ShowtimeMapper.toEntity(createInput, 1, 99);

            expect((result.movie as any).connect.id).toBe(99);
        });

        it("should not include cinemaId or roomId UUID fields in the entity", () => {
            const result = ShowtimeMapper.toEntity(createInput, 1, 42) as any;

            expect(result.cinemaId).toBeUndefined();
            expect(result.movieId).toBeUndefined();
        });

        it("should produce consistent output for the same input", () => {
            const r1 = ShowtimeMapper.toEntity(createInput, 5, 10);
            const r2 = ShowtimeMapper.toEntity(createInput, 5, 10);

            expect(r1).toEqual(r2);
        });
    });

    describe("toDetailOutput", () => {
        const mockShowtimesWithMovie = [
            {
                idPublic: "showtime-uuid-1",
                dateTime: new Date("2026-10-01T14:00:00.000Z"),
                movie: {
                    idPublic: MOVIE_UUID,
                    title: "Inception",
                    description: "A thief who steals corporate secrets...",
                    duration: 148,
                    releaseDate: new Date("2010-07-16T00:00:00.000Z"),
                    s3KeyPoster: "posters/inception.webp",
                },
            },
            {
                idPublic: "showtime-uuid-2",
                dateTime: new Date("2026-10-01T18:00:00.000Z"),
                movie: {
                    idPublic: MOVIE_UUID,
                    title: "Inception",
                    description: "A thief who steals corporate secrets...",
                    duration: 148,
                    releaseDate: new Date("2010-07-16T00:00:00.000Z"),
                    s3KeyPoster: "posters/inception.webp",
                },
            },
        ];

        it("should map movie details and showtime dates correctly", () => {
            const result = ShowtimeMapper.toDetailOutput(mockShowtimesWithMovie as any);

            expect(result.id).toBe(MOVIE_UUID);
            expect(result.title).toBe("Inception");
            expect(result.description).toBe("A thief who steals corporate secrets...");
            expect(result.runtime).toBe(148);
            expect(result.releaseDate).toBe("2010-07-16T00:00:00.000Z");
            expect(result.posterUrl).toBe("posters/inception.webp");
            expect(result.dateTime).toHaveLength(2);
            expect(result.dateTime[0]).toEqual({
                id: "showtime-uuid-1",
                dateTime: "2026-10-01T14:00:00.000Z",
            });
            expect(result.dateTime[1]).toEqual({
                id: "showtime-uuid-2",
                dateTime: "2026-10-01T18:00:00.000Z",
            });
        });
    });
});
