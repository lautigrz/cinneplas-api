import { Module } from "@nestjs/common";
import { S3Service } from "./s3/S3Service.js";
import { AwsController } from "./AwsController.js";
import { AWS_SERVICE } from "./interfaces/AwsService.js";

@Module({
    imports: [],
    controllers: [AwsController],
    providers: [
        { provide: AWS_SERVICE, useClass: S3Service }
    ],
    exports: [
        { provide: AWS_SERVICE, useClass: S3Service }
    ],
})
export class AwsModule { }