import { describe, expect, it } from 'vitest';
import { HttpStatus } from '@nestjs/common';

import { ApiException } from '../base/ApiException.js';

// ─────────────────────────────────────────────────────────────────────────────

describe('ApiException', () => {
    it('should extend HttpException', () => {
        const exception = new ApiException('test', HttpStatus.BAD_REQUEST);

        expect(exception).toBeInstanceOf(ApiException);
        expect(exception.getStatus).toBeDefined();
    });

    it('should set the HTTP status code correctly', () => {
        const exception = new ApiException('Forbidden', HttpStatus.FORBIDDEN);

        expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
    });

    it('should default to 400 BAD_REQUEST when no status is provided', () => {
        const exception = new ApiException('Bad data');

        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should include the message in the response body', () => {
        const exception = new ApiException('Resource not found', HttpStatus.NOT_FOUND, 'RESOURCE_NOT_FOUND');

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe('Resource not found');
    });

    it('should include the errorCode in the response body', () => {
        const exception = new ApiException('Conflict', HttpStatus.CONFLICT, 'DUPLICATE_KEY');

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.errorCode).toBe('DUPLICATE_KEY');
    });

    it('should include the statusCode in the response body', () => {
        const exception = new ApiException('Unprocessable', HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION_FAILED');

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('should allow errorCode to be undefined', () => {
        const exception = new ApiException('Something failed', HttpStatus.INTERNAL_SERVER_ERROR);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.errorCode).toBeUndefined();
    });
});
