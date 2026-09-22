import { Injectable } from "@nestjs/common";
import {
    DeleteObjectCommand,
    ListBucketsCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import type { AwsService } from "../interfaces/AwsService.js";
import { AwsDeleteException, AwsUploadException } from "../exceptions/AwsExceptions.js";

type ImageDirectory = "posters" | "backdrops";

@Injectable()
export class S3Service implements AwsService {
    private readonly s3Client: S3Client;

    constructor(s3Client?: S3Client) {
        this.s3Client = s3Client ?? new S3Client({
            region: process.env.AWS_REGION,
        });
    }

    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: key,
            });
            await this.s3Client.send(command);
        } catch (error) {
            throw new AwsDeleteException(key);
        }
    }

    async listBuckets() {
        const command = new ListBucketsCommand({});
        const response = await this.s3Client.send(command);
        return response.Buckets;
    }

    async uploadTest() {
        const key = "poster/test.txt";

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: "Hola desde Cineplas + NestJS + AWS",
            ContentType: "text/plain",
        });

        await this.s3Client.send(command);

        return {
            message: "Archivo subido correctamente",
            key,
        };
    }

    async uploadFile(file: Buffer, directory: ImageDirectory): Promise<string> {
        const key = `${directory}/${Date.now()}.webp`;

        try {
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: key,
                Body: file,
                ContentType: "image/webp",
            });

            await this.s3Client.send(command);

            return key;
        } catch (error) {
            throw new AwsUploadException(key);
        }
    }
}