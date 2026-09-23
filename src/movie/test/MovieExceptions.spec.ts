import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { MovieConflictException } from "../exceptions/ConflictException.js";
import { ApiException } from "../../common/base/ApiException.js";

describe("Movie Exceptions", () => {
    describe("MovieConflictException", () => {
        it("should format message, status and errorCode correctly", () => {
            const error = new MovieConflictException();
            const response = error.getResponse() as any;

            expect(error).toBeInstanceOf(ApiException);
            expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
            expect(response.message).toBe("La película ya existe");
            expect(response.errorCode).toBe("MOVIE_CONFLICT");
        });
    });
});
