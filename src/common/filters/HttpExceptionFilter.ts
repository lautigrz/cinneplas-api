import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { ApiException } from "../base/ApiException.js";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

        let body: Record<string, any> = { message: "Error interno del servidor" }

        if (exception instanceof ApiException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            body = typeof res === 'object' ? res : { message: res };

            this.logger.warn(`ApiException: ${body.message} (${body.errorCode})`);
        }


        response.status(status).json({
            ...body,
            statusCode: status,
            timeStamp: new Date().toISOString(),
            path: request.url,
        })
    }

}