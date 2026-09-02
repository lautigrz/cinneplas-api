import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { z } from 'zod';

import { HttpExceptionFilter } from '../filters/HttpExceptionFilter.js';
import { ApiException } from '../base/ApiException.js';

// ─────────────────────────────────────────────────────────────────────────────

function buildMockHost(overrides: { url?: string } = {}): {
    host: ArgumentsHost;
    json: ReturnType<typeof vi.fn>;
    status: ReturnType<typeof vi.fn>;
} {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });

    const host = {
        switchToHttp: vi.fn().mockReturnValue({
            getResponse: vi.fn().mockReturnValue({ status }),
            getRequest: vi.fn().mockReturnValue({ url: overrides.url ?? '/api/test' }),
        }),
    } as unknown as ArgumentsHost;

    return { host, json, status };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('HttpExceptionFilter', () => {
    let filter: HttpExceptionFilter;

    beforeEach(() => {
        filter = new HttpExceptionFilter();
    });

    it('should be defined', () => {
        expect(filter).toBeDefined();
    });

    describe('when the exception is an ApiException', () => {
        it('should respond with the HTTP status from the exception', () => {
            const exception = new ApiException('Not found', HttpStatus.NOT_FOUND, 'RESOURCE_NOT_FOUND');
            const { host, status } = buildMockHost();

            filter.catch(exception, host);

            expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
        });

        it('should include the errorCode in the response body', () => {
            const exception = new ApiException('Conflict', HttpStatus.CONFLICT, 'DUPLICATE_ENTRY');
            const { host, json } = buildMockHost();

            filter.catch(exception, host);

            expect(json).toHaveBeenCalledWith(
                expect.objectContaining({ errorCode: 'DUPLICATE_ENTRY' }),
            );
        });

        it('should include the message in the response body', () => {
            const exception = new ApiException('Invalid credentials', HttpStatus.UNAUTHORIZED, 'AUTH_INVALID_CREDENTIALS');
            const { host, json } = buildMockHost();

            filter.catch(exception, host);

            expect(json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Invalid credentials' }),
            );
        });

        it('should include statusCode and timeStamp and path in the response body', () => {
            const exception = new ApiException('Bad request', HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR');
            const { host, json } = buildMockHost({ url: '/api/auth/login' });

            filter.catch(exception, host);

            const body = json.mock.calls[0][0];
            expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(body.path).toBe('/api/auth/login');
            expect(body.timeStamp).toBeDefined();
            expect(() => new Date(body.timeStamp)).not.toThrow();
        });
    });

    describe('when the exception is a generic Error (non-ApiException)', () => {
        it('should respond with 500 INTERNAL_SERVER_ERROR', () => {
            const exception = new Error('Something went terribly wrong');
            const { host, status } = buildMockHost();

            filter.catch(exception, host);

            expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        });

        it('should respond with a generic error message in Spanish', () => {
            const exception = new Error('Unexpected crash');
            const { host, json } = buildMockHost();

            filter.catch(exception, host);

            expect(json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Error interno del servidor' }),
            );
        });

        it('should still include statusCode, timeStamp and path in the response', () => {
            const { host, json } = buildMockHost({ url: '/api/cinemas' });

            filter.catch(new Error('boom'), host);

            const body = json.mock.calls[0][0];
            expect(body.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(body.path).toBe('/api/cinemas');
            expect(body.timeStamp).toBeDefined();
        });
    });


    describe('when the exception is a ZodValidationException', () => {
        function buildZodValidationException(): ZodValidationException {
            const schema = z.object({
                name: z.string().min(5, 'El nombre debe tener al menos 5 caracteres'),
                address: z.string().min(10, 'La dirección debe tener al menos 10 caracteres'),
            });
            const result = schema.safeParse({ name: 'ab', address: 'x' });
            return new ZodValidationException((result as any).error);
        }

        it('should respond with 422 UNPROCESSABLE_ENTITY', () => {
            const { host, status } = buildMockHost();

            filter.catch(buildZodValidationException(), host);

            expect(status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should include a human-readable message', () => {
            const { host, json } = buildMockHost();

            filter.catch(buildZodValidationException(), host);

            expect(json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Datos de entrada inválidos' }),
            );
        });

        it('should include an errors array with field and message per violation', () => {
            const { host, json } = buildMockHost();

            filter.catch(buildZodValidationException(), host);

            const body = json.mock.calls[0][0];
            expect(Array.isArray(body.errors)).toBe(true);
            expect(body.errors.length).toBeGreaterThan(0);
            body.errors.forEach((e: any) => {
                expect(e).toHaveProperty('field');
                expect(e).toHaveProperty('message');
            });
        });

        it('should still include statusCode, timeStamp and path', () => {
            const { host, json } = buildMockHost({ url: '/api/cinemas' });

            filter.catch(buildZodValidationException(), host);

            const body = json.mock.calls[0][0];
            expect(body.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
            expect(body.path).toBe('/api/cinemas');
            expect(body.timeStamp).toBeDefined();
        });
    });


    describe('when the exception is an HttpException (NestJS / Passport)', () => {
        it('should respond with 401 for UnauthorizedException', () => {
            const { host, status } = buildMockHost();

            filter.catch(new UnauthorizedException('Credenciales inválidas'), host);

            expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
        });

        it('should include the message from the HttpException', () => {
            const { host, json } = buildMockHost();

            filter.catch(new HttpException('Forbidden resource', HttpStatus.FORBIDDEN), host);

            expect(json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Forbidden resource' }),
            );
        });

        it('should still include statusCode, timeStamp and path', () => {
            const { host, json } = buildMockHost({ url: '/api/auth/me' });

            filter.catch(new UnauthorizedException(), host);

            const body = json.mock.calls[0][0];
            expect(body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
            expect(body.path).toBe('/api/auth/me');
            expect(body.timeStamp).toBeDefined();
        });
    });
});
