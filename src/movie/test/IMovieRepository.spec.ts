import { describe, it, expect, vi, beforeEach } from "vitest";
import { IMovieRepository } from "../MovieRepository.js";
import { ConflictException } from "@nestjs/common";
import { Prisma } from "../../generated/prisma/client.js";
import type { MovieInput } from "../contracts/movie.schema.js";

const mockMovieInput: MovieInput = {
    original_title: "Inception",
    overview: "A thief who steals corporate secrets.",
    poster_path: "/poster.jpg",
    backdrop_path: "/backdrop.jpg",
    runtime: 148,
    release_date: "2010-07-16",
};

const mockPrismaService = {
    movie: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
};

describe("IMovieRepository", () => {
    let repository: IMovieRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        // Instantiate directly to avoid NestJS DI token resolution issues with PrismaService
        repository = new IMovieRepository(mockPrismaService as any);
    });

    describe("save", () => {
        it("should save a movie and return its public id", async () => {
            const createdMovie = { idPublic: "abc-123" };
            mockPrismaService.movie.create.mockResolvedValue(createdMovie);

            const result = await repository.save(mockMovieInput, "posters/key", "backdrops/key");

            expect(mockPrismaService.movie.create).toHaveBeenCalledOnce();
            expect(result).toBe("abc-123");
        });

        it("should map MovieInput fields to Prisma create input via MovieMapper", async () => {
            mockPrismaService.movie.create.mockResolvedValue({ idPublic: "mapped-id" });

            await repository.save(mockMovieInput, "p-key", "b-key");

            expect(mockPrismaService.movie.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    title: "Inception",
                    s3KeyPoster: "p-key",
                    s3KeyBackdrop: "b-key",
                    description: mockMovieInput.overview,
                    duration: 148,
                    releaseDate: new Date("2010-07-16"),
                }),
            });
        });

        it("should throw ConflictException when Prisma P2002 (unique constraint) error occurs", async () => {
            const prismaError = new Prisma.PrismaClientKnownRequestError(
                "Unique constraint failed",
                { code: "P2002", clientVersion: "7.0.0", meta: {} }
            );
            mockPrismaService.movie.create.mockRejectedValue(prismaError);

            await expect(
                repository.save(mockMovieInput, "posters/key", "backdrops/key")
            ).rejects.toThrow(ConflictException);
        });

        it("should rethrow unknown errors from Prisma on save", async () => {
            const unknownError = new Error("Unknown DB error");
            mockPrismaService.movie.create.mockRejectedValue(unknownError);

            await expect(
                repository.save(mockMovieInput, "posters/key", "backdrops/key")
            ).rejects.toThrow("Unknown DB error");
        });
    });

    describe("delete", () => {
        it("should delete a movie by public id", async () => {
            mockPrismaService.movie.delete.mockResolvedValue({});

            await repository.delete("abc-123");

            expect(mockPrismaService.movie.delete).toHaveBeenCalledWith({
                where: { idPublic: "abc-123" },
            });
        });

        it("should throw ConflictException when Prisma P2025 (record not found) error occurs", async () => {
            const prismaError = new Prisma.PrismaClientKnownRequestError(
                "Record not found",
                { code: "P2025", clientVersion: "7.0.0", meta: {} }
            );
            mockPrismaService.movie.delete.mockRejectedValue(prismaError);

            await expect(repository.delete("nonexistent-id")).rejects.toThrow(ConflictException);
        });

        it("should rethrow unknown errors from Prisma on delete", async () => {
            const unknownError = new Error("Connection lost");
            mockPrismaService.movie.delete.mockRejectedValue(unknownError);

            await expect(repository.delete("abc-123")).rejects.toThrow("Connection lost");
        });
    });

    describe("saveKeyS3", () => {
        it("should update S3 keys for a movie", async () => {
            mockPrismaService.movie.update.mockResolvedValue({});

            await repository.saveKeyS3("abc-123", "posters/key", "backdrops/key");

            expect(mockPrismaService.movie.update).toHaveBeenCalledWith({
                where: { idPublic: "abc-123" },
                data: {
                    s3KeyPoster: "posters/key",
                    s3KeyBackdrop: "backdrops/key",
                },
            });
        });

        it("should throw ConflictException when Prisma P2025 (record not found) error occurs on update", async () => {
            const prismaError = new Prisma.PrismaClientKnownRequestError(
                "Record not found",
                { code: "P2025", clientVersion: "7.0.0", meta: {} }
            );
            mockPrismaService.movie.update.mockRejectedValue(prismaError);

            await expect(
                repository.saveKeyS3("nonexistent-id", "k1", "k2")
            ).rejects.toThrow(ConflictException);
        });

        it("should rethrow unknown errors from Prisma on saveKeyS3", async () => {
            const unknownError = new Error("Timeout");
            mockPrismaService.movie.update.mockRejectedValue(unknownError);

            await expect(
                repository.saveKeyS3("abc-123", "k1", "k2")
            ).rejects.toThrow("Timeout");
        });
    });
});
