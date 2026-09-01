import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';

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
});
