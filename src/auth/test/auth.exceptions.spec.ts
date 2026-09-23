import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { InvalidCredentialsException } from "../exceptions/InvalidCredentialsException.js";
import { UserAlreadyExistsException } from "../exceptions/UserAlreadyExistsException.js";
import { ApiException } from "../../common/base/ApiException.js";

describe("Auth Exceptions", () => {
    describe("InvalidCredentialsException", () => {
        it("should format message, status and errorCode correctly", () => {
            const error = new InvalidCredentialsException();
            const response = error.getResponse() as any;

            expect(error).toBeInstanceOf(ApiException);
            expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
            expect(response.message).toBe("Invalid credentials");
            expect(response.errorCode).toBe("AUTH_INVALID_CREDENTIALS");
        });
    });

    describe("UserAlreadyExistsException", () => {
        it("should format message with email, status and errorCode correctly", () => {
            const error = new UserAlreadyExistsException("user@example.com");
            const response = error.getResponse() as any;

            expect(error).toBeInstanceOf(ApiException);
            expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
            expect(response.message).toBe("El usuario con el email user@example.com ya existe.");
            expect(response.errorCode).toBe("AUTH_USER_ALREADY_EXISTS");
        });
    });
});
