

import { HttpException, HttpStatus } from "@nestjs/common";

export class ApiException extends HttpException {
    constructor(
        message: string,
        statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
        errorCode?: string
    ) {
        super({
            message,
            statusCode,
            errorCode
        }, statusCode);
    }
}