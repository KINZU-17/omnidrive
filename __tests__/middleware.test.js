const logger = require('../config/logger');

describe('Logging System', () => {
    it('should be configured', () => {
        expect(logger).toBeDefined();
        expect(logger.info).toBeDefined();
        expect(logger.error).toBeDefined();
        expect(logger.warn).toBeDefined();
    });

    it('should log info messages', () => {
        const spy = jest.spyOn(logger, 'info');
        logger.info('Test message', { context: 'test' });
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    it('should log error messages', () => {
        const spy = jest.spyOn(logger, 'error');
        logger.error('Test error', { context: 'test' });
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    it('should log warning messages', () => {
        const spy = jest.spyOn(logger, 'warn');
        logger.warn('Test warning', { context: 'test' });
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});

describe('Validation Middleware', () => {
    const { validateBody, validateQuery } = require('../middleware/validation');
    const { z } = require('zod');

    it('should validate request body', () => {
        const schema = z.object({ email: z.string().email() });
        const middleware = validateBody(schema);
        
        const req = { body: { email: 'test@example.com' } };
        const res = {};
        const next = jest.fn();
        
        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should reject invalid request body', () => {
        const schema = z.object({ email: z.string().email() });
        const middleware = validateBody(schema);
        
        const req = { body: { email: 'invalid-email' } };
        const res = { 
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        
        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
    });
});

describe('Error Handler Middleware', () => {
    const { errorHandler, asyncHandler } = require('../middleware/errorHandler');

    it('should handle errors and return normalized response', () => {
        const error = new Error('Test error');
        const req = { path: '/test', method: 'GET' };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        errorHandler(error, req, res, next);
        
        expect(res.status).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
    });

    it('should wrap async route handlers', (done) => {
        const handler = asyncHandler((req, res) => {
            return Promise.resolve(res.json({ success: true }));
        });

        const req = {};
        const res = { json: jest.fn() };
        const next = jest.fn();

        handler(req, res, next);
        
        setTimeout(() => {
            expect(res.json).toHaveBeenCalled();
            done();
        }, 50);
    });
});

describe('Response Normalizer Middleware', () => {
    const normalizeResponse = require('../middleware/responseNormalizer');

    it('should normalize success responses', () => {
        const req = {};
        const res = {
            statusCode: 200,
            json: jest.fn().mockImplementation((data) => data),
        };
        const next = jest.fn();

        normalizeResponse(req, res, next);
        expect(next).toHaveBeenCalled();

        const result = res.json({ user: 'John' });
        expect(result.success).toBe(true);
        expect(result.data).toEqual({ user: 'John' });
    });

    it('should normalize error responses', () => {
        const req = {};
        const res = {
            statusCode: 400,
            json: jest.fn().mockImplementation((data) => data),
        };
        const next = jest.fn();

        normalizeResponse(req, res, next);

        const result = res.json({ error: 'Invalid input' });
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
    });
});
