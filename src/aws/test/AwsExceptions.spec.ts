import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { AwsUploadException, AwsDeleteException } from "../exceptions/AwsExceptions.js";
import { ApiException } from "../../common/base/ApiException.js";

describe("AwsExceptions", () => {
    describe("AwsUploadException", () => {
        it("should be an instance of ApiException", () => {
            const exception = new AwsUploadException("posters/key.webp");
            expect(exception).toBeInstanceOf(ApiException);
        });

        it("should have INTERNAL_SERVER_ERROR status", () => {
            const exception = new AwsUploadException("posters/key.webp");
            expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });

        it("should have errorCode AWS_UPLOAD_FAILED", () => {
            const exception = new AwsUploadException("posters/key.webp");
            const response = exception.getResponse() as any;
            expect(response.errorCode).toBe("AWS_UPLOAD_FAILED");
        });

        it("should include the key in the message when provided", () => {
            const exception = new AwsUploadException("posters/my-image.webp");
            const response = exception.getResponse() as any;
            expect(response.message).toContain("posters/my-image.webp");
        });

        it("should have a generic message when key is not provided", () => {
            const exception = new AwsUploadException();
            const response = exception.getResponse() as any;
            expect(response.message).toBeTruthy();
            expect(typeof response.message).toBe("string");
        });
    });

    describe("AwsDeleteException", () => {
        it("should be an instance of ApiException", () => {
            const exception = new AwsDeleteException("posters/key.webp");
            expect(exception).toBeInstanceOf(ApiException);
        });

        it("should have INTERNAL_SERVER_ERROR status", () => {
            const exception = new AwsDeleteException("posters/key.webp");
            expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });

        it("should have errorCode AWS_DELETE_FAILED", () => {
            const exception = new AwsDeleteException("posters/key.webp");
            const response = exception.getResponse() as any;
            expect(response.errorCode).toBe("AWS_DELETE_FAILED");
        });

        it("should include the key in the message", () => {
            const exception = new AwsDeleteException("backdrops/to-delete.webp");
            const response = exception.getResponse() as any;
            expect(response.message).toContain("backdrops/to-delete.webp");
        });
    });
});
