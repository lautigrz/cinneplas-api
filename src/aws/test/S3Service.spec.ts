import { describe, it, expect, vi, beforeEach } from "vitest";

import { S3Service } from "../s3/S3Service.js";
import { AwsUploadException, AwsDeleteException } from "../exceptions/AwsExceptions.js";

const mockSend = vi.fn();
const mockS3Client = { send: mockSend } as any;

describe("S3Service", () => {
    let service: S3Service;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.AWS_S3_BUCKET_NAME = "test-bucket";
        process.env.AWS_REGION = "us-east-1";
        service = new S3Service(mockS3Client);
    });

    describe("uploadFile", () => {
        const fileBuffer = Buffer.from("fake-image-data");

        it("should upload a file and return its key in the correct directory", async () => {
            mockSend.mockResolvedValue({});

            const result = await service.uploadFile(fileBuffer, "posters");

            expect(mockSend).toHaveBeenCalledOnce();
            expect(result).toMatch(/^posters\/\d+\.webp$/);
        });

        it("should upload to backdrops directory when specified", async () => {
            mockSend.mockResolvedValue({});

            const result = await service.uploadFile(fileBuffer, "backdrops");

            expect(result).toMatch(/^backdrops\/\d+\.webp$/);
        });

        it("should call S3 PutObjectCommand with correct params", async () => {
            mockSend.mockResolvedValue({});

            await service.uploadFile(fileBuffer, "posters");

            const sentCommand = mockSend.mock.calls[0][0];
            expect(sentCommand.input).toMatchObject({
                Bucket: "test-bucket",
                Body: fileBuffer,
                ContentType: "image/webp",
            });
            expect(sentCommand.input.Key).toMatch(/^posters\//);
        });

        it("should generate a unique key using timestamp", async () => {
            mockSend.mockResolvedValue({});

            const [key1, key2] = await Promise.all([
                service.uploadFile(fileBuffer, "posters"),
                service.uploadFile(fileBuffer, "posters"),
            ]);

            expect(key2).toMatch(/^posters\/\d+\.webp$/);
        });

        it("should throw AwsUploadException when S3 send fails", async () => {
            mockSend.mockRejectedValue(new Error("S3 connection timeout"));

            await expect(service.uploadFile(fileBuffer, "posters")).rejects.toThrow(
                AwsUploadException
            );
        });

        it("should include the key in the AwsUploadException message", async () => {
            mockSend.mockRejectedValue(new Error("S3 error"));

            const error = await service.uploadFile(fileBuffer, "posters").catch((e) => e);

            expect(error.getResponse().message).toContain("posters/");
            expect(error.getResponse().errorCode).toBe("AWS_UPLOAD_FAILED");
        });
    });

    describe("deleteFile", () => {
        it("should delete a file by key", async () => {
            mockSend.mockResolvedValue({});

            await service.deleteFile("posters/some-key.webp");

            expect(mockSend).toHaveBeenCalledOnce();
        });

        it("should call S3 DeleteObjectCommand with correct params", async () => {
            mockSend.mockResolvedValue({});

            await service.deleteFile("backdrops/abc123.webp");

            const sentCommand = mockSend.mock.calls[0][0];
            expect(sentCommand.input).toMatchObject({
                Bucket: "test-bucket",
                Key: "backdrops/abc123.webp",
            });
        });

        it("should throw AwsDeleteException when S3 send fails", async () => {
            mockSend.mockRejectedValue(new Error("Access denied"));

            await expect(service.deleteFile("posters/key.webp")).rejects.toThrow(
                AwsDeleteException
            );
        });

        it("should include the key in the AwsDeleteException message", async () => {
            mockSend.mockRejectedValue(new Error("Access denied"));

            const error = await service.deleteFile("posters/key.webp").catch((e) => e);

            expect(error.getResponse().message).toContain("posters/key.webp");
            expect(error.getResponse().errorCode).toBe("AWS_DELETE_FAILED");
        });
    });

    describe("listBuckets", () => {
        it("should return the list of buckets", async () => {
            const mockBuckets = [{ Name: "bucket-1" }, { Name: "bucket-2" }];
            mockSend.mockResolvedValue({ Buckets: mockBuckets });

            const result = await service.listBuckets();

            expect(result).toEqual(mockBuckets);
        });

        it("should return undefined if no buckets exist", async () => {
            mockSend.mockResolvedValue({ Buckets: undefined });

            const result = await service.listBuckets();

            expect(result).toBeUndefined();
        });
    });

    describe("uploadTest", () => {
        it("should upload a test file and return the key and success message", async () => {
            mockSend.mockResolvedValue({});

            const result = await service.uploadTest();

            expect(result).toEqual({
                message: "Archivo subido correctamente",
                key: "poster/test.txt",
            });
        });

        it("should call PutObjectCommand with the test file content", async () => {
            mockSend.mockResolvedValue({});

            await service.uploadTest();

            const sentCommand = mockSend.mock.calls[0][0];
            expect(sentCommand.input).toMatchObject({
                Bucket: "test-bucket",
                Key: "poster/test.txt",
                Body: "Hola desde Cineplas + NestJS + AWS",
                ContentType: "text/plain",
            });
        });
    });
});
