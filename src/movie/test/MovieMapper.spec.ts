import { describe, it, expect } from "vitest";
import { MovieMapper } from "../mappers/movie.mapper.js";
import type { MovieInput } from "../contracts/movie.schema.js";

const mockMovieInput: MovieInput = {
    original_title: "Inception",
    overview: "A thief who steals corporate secrets through dream-sharing technology.",
    poster_path: "/poster.jpg",
    backdrop_path: "/backdrop.jpg",
    runtime: 148,
    release_date: "2010-07-16",
};

describe("MovieMapper", () => {
    describe("toEntity", () => {
        it("should map MovieInput to Prisma.MovieCreateInput correctly", () => {
            const result = MovieMapper.toEntity(mockMovieInput, "posters/key-123", "backdrops/key-456");

            expect(result).toEqual({
                title: "Inception",
                s3KeyPoster: "posters/key-123",
                s3KeyBackdrop: "backdrops/key-456",
                description: "A thief who steals corporate secrets through dream-sharing technology.",
                duration: 148,
                releaseDate: new Date("2010-07-16"),
            });
        });

        it("should convert release_date string to a Date object", () => {
            const result = MovieMapper.toEntity(mockMovieInput, "key1", "key2");

            expect(result.releaseDate).toBeInstanceOf(Date);
            expect((result.releaseDate as Date).toISOString()).toContain("2010-07-16");
        });

        it("should use the provided S3 keys for poster and backdrop", () => {
            const posterKey = "posters/unique-poster-key";
            const backdropKey = "backdrops/unique-backdrop-key";

            const result = MovieMapper.toEntity(mockMovieInput, posterKey, backdropKey);

            expect(result.s3KeyPoster).toBe(posterKey);
            expect(result.s3KeyBackdrop).toBe(backdropKey);
        });

        it("should map original_title to title field", () => {
            const input: MovieInput = { ...mockMovieInput, original_title: "The Matrix" };

            const result = MovieMapper.toEntity(input, "k1", "k2");

            expect(result.title).toBe("The Matrix");
        });

        it("should map overview to description field", () => {
            const input: MovieInput = { ...mockMovieInput, overview: "A new description" };

            const result = MovieMapper.toEntity(input, "k1", "k2");

            expect(result.description).toBe("A new description");
        });

        it("should map runtime to duration field", () => {
            const input: MovieInput = { ...mockMovieInput, runtime: 200 };

            const result = MovieMapper.toEntity(input, "k1", "k2");

            expect(result.duration).toBe(200);
        });
    });
});
