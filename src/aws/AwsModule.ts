import { Module } from "@nestjs/common";
import { S3Service } from "./s3/S3Service.js";
import { AwsController } from "./AwsController.js";
import { AWS_SERVICE } from "./interfaces/AwsService.js";
import { S3Client } from "@aws-sdk/client-s3";

@Module({
    imports: [],
    controllers: [AwsController],
    providers: [
        {
            provide: S3Client,
            useFactory() {
                return new S3Client({
                    region: process.env.AWS_REGION
                });
            },
        },
        {
            provide: AWS_SERVICE,
            useClass: S3Service
        }
    ],
    exports: [
        { provide: AWS_SERVICE, useClass: S3Service }
    ],
})
export class AwsModule { }