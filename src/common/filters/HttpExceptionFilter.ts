import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";
import { ApiException } from "../base/ApiException.js";
import { ZodValidationException } from "nestjs-zod";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let body: Record<string, any> = { message: "Error interno del servidor" };
        if (exception instanceof ZodValidationException) {
            status = HttpStatus.UNPROCESSABLE_ENTITY;
            const zodError = exception.getZodError();
            const issues = (zodError as any).issues ?? (zodError as any).errors ?? [];
            body = {
                message: "Datos de entrada inválidos",
                errors: issues.map((e: any) => ({
                    field: (e.path ?? []).join("."),
                    message: e.message,
                })),
            };
            this.logger.warn(`ZodValidationException: ${JSON.stringify(body.errors)}`);
        }

        else if (exception instanceof ApiException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            body = typeof res === "object" ? (res as Record<string, any>) : { message: res };
            this.logger.warn(`ApiException [${status}]: ${body.message} (${body.errorCode})`);
        }

        else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            body = typeof res === "object" ? (res as Record<string, any>) : { message: res };
            this.logger.warn(`HttpException [${status}]: ${body.message ?? exception.message}`);
        }

        else {
            this.logger.error(
                `Unhandled exception: ${(exception as Error)?.message}`,
                (exception as Error)?.stack,
            );
        }

        response.status(status).json({
            ...body,
            statusCode: status,
            timeStamp: new Date().toISOString(),
            path: request.url,
        });
    }
}