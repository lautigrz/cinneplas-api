import { Controller, Get, UseInterceptors, UploadedFile, Inject } from "@nestjs/common";
import { FileInterceptor } from '@nestjs/platform-express';
import type { AwsService } from "./interfaces/AwsService.js";
import { AWS_SERVICE } from "./interfaces/AwsService.js";

@Controller({ path: "/aws" })
export class AwsController {
    constructor(
        @Inject(AWS_SERVICE)
        private readonly awsService: AwsService) { }







}