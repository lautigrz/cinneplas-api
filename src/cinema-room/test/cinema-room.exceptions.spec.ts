import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { CinemaNotFoundException } from "../exceptions/CinemaNotFoundException.js";
import { CinemaRoomNotFoundException } from "../exceptions/CinemaRoomNotFoundException.js";
import { ApiException } from "../../common/base/ApiException.js";

describe("CinemaRoom Exceptions", () => {
    describe("CinemaNotFoundException", () => {
        it("should format message, status and errorCode correctly", () => {
            const error = new CinemaNotFoundException("cinema-uuid-123");
            const response = error.getResponse() as any;

            expect(error).toBeInstanceOf(ApiException);
            expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
            expect(response.message).toBe("El cine con ID cinema-uuid-123 no existe.");
            expect(response.errorCode).toBe("CINEMA_NOT_FOUND");
        });
    });

    describe("CinemaRoomNotFoundException", () => {
        it("should format message, status and errorCode correctly", () => {
            const error = new CinemaRoomNotFoundException("room-uuid-456");
            const response = error.getResponse() as any;

            expect(error).toBeInstanceOf(ApiException);
            expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
            expect(response.message).toBe("La sala con ID room-uuid-456 no existe.");
            expect(response.errorCode).toBe("CINEMA_ROOM_NOT_FOUND");
        });
    });
});
