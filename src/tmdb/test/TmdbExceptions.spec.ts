import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import {
    TmdbMovieNotFoundException,
    TmdbServiceUnavailableException,
} from "../exceptions/TmdbExceptions.js";
import { ApiException } from "../../common/base/ApiException.js";

describe("TmdbExceptions", () => {
    describe("TmdbMovieNotFoundException", () => {
        it("should be an instance of ApiException", () => {
            const exception = new TmdbMovieNotFoundException(123);
            expect(exception).toBeInstanceOf(ApiException);
        });

        it("should have NOT_FOUND status", () => {
            const exception = new TmdbMovieNotFoundException(123);
            expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
        });

        it("should include the movie id in the message", () => {
            const exception = new TmdbMovieNotFoundException(42);
            const response = exception.getResponse() as any;
            expect(response.message).toContain("42");
        });

        it("should have errorCode TMDB_MOVIE_NOT_FOUND", () => {
            const exception = new TmdbMovieNotFoundException(1);
            const response = exception.getResponse() as any;
            expect(response.errorCode).toBe("TMDB_MOVIE_NOT_FOUND");
        });
    });

    describe("TmdbServiceUnavailableException", () => {
        it("should be an instance of ApiException", () => {
            const exception = new TmdbServiceUnavailableException();
            expect(exception).toBeInstanceOf(ApiException);
        });

        it("should have SERVICE_UNAVAILABLE status", () => {
            const exception = new TmdbServiceUnavailableException();
            expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        });

        it("should have errorCode TMDB_SERVICE_UNAVAILABLE", () => {
            const exception = new TmdbServiceUnavailableException();
            const response = exception.getResponse() as any;
            expect(response.errorCode).toBe("TMDB_SERVICE_UNAVAILABLE");
        });

        it("should have a descriptive message", () => {
            const exception = new TmdbServiceUnavailableException();
            const response = exception.getResponse() as any;
            expect(response.message).toBeTruthy();
            expect(typeof response.message).toBe("string");
        });
    });
});
