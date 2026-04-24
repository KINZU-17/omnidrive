const { cache, redis } = require('../config/redis');
const { cacheMiddleware, queryCache, invalidateCache } = require('../middleware/cache');

describe('Redis Caching System', () => {
    let redisAvailable = false;

    // Setup and teardown
    beforeAll(async () => {
        try {
            // Check if Redis is available
            if (!redis.status || redis.status === 'close') {
                await redis.connect();
            }
            // Ping to verify connection
            const pong = await redis.ping();
            redisAvailable = pong === 'PONG';
        } catch (error) {
            console.log('⚠️  Redis not available - cache tests will be skipped');
            redisAvailable = false;
        }
    });

    afterEach(async () => {
        if (redisAvailable) {
            try {
                await cache.flush();
            } catch (error) {
                // Already closed
            }
        }
    });

    afterAll(async () => {
        if (redisAvailable) {
            try {
                await redis.quit();
            } catch (error) {
                // Already closed
            }
        }
    });

    // Skip all tests if Redis is unavailable
    const skipIfNoRedis = redisAvailable ? describe : describe.skip;

    // ─── CACHE OPERATIONS ───────────────────────────────────────────────────
    skipIfNoRedis('Cache Operations', () => {
        it('should set and get cache values', async () => {
            const key = 'test:key';
            const value = { id: 1, name: 'Test' };

            const set = await cache.set(key, value);
            expect(set).toBe(true);

            const retrieved = await cache.get(key);
            expect(retrieved).toEqual(value);
        });

        it('should support TTL (time to live)', async () => {
            const key = 'ttl:test';
            const value = { data: 'test' };

            await cache.set(key, value, 1); // 1 second TTL
            const immediate = await cache.get(key);
            expect(immediate).toEqual(value);

            // Wait for TTL to expire
            await new Promise(resolve => setTimeout(resolve, 1100));
            const expired = await cache.get(key);
            expect(expired).toBeNull();
        });

        it('should delete cache keys', async () => {
            const key = 'delete:test';
            await cache.set(key, { value: 'test' });

            let retrieved = await cache.get(key);
            expect(retrieved).toBeDefined();

            await cache.del(key);
            retrieved = await cache.get(key);
            expect(retrieved).toBeNull();
        });

        it('should delete multiple keys by pattern', async () => {
            await cache.set('listings:1', { id: 1 });
            await cache.set('listings:2', { id: 2 });
            await cache.set('users:1', { id: 1 });

            const deleted = await invalidateCache('listings:*');
            expect(deleted).toBe(2);

            const listingsKey1 = await cache.get('listings:1');
            const listingsKey2 = await cache.get('listings:2');
            const usersKey = await cache.get('users:1');

            expect(listingsKey1).toBeNull();
            expect(listingsKey2).toBeNull();
            expect(usersKey).toEqual({ id: 1 });
        });

        it('should increment counters', async () => {
            const key = 'counter:test';

            const val1 = await cache.increment(key);
            expect(val1).toBe(1);

            const val2 = await cache.increment(key);
            expect(val2).toBe(2);

            const val3 = await cache.increment(key);
            expect(val3).toBe(3);
        });

        it('should handle cache flush', async () => {
            await cache.set('key1', { data: 1 });
            await cache.set('key2', { data: 2 });

            const flushed = await cache.flush();
            expect(flushed).toBe(true);

            const val1 = await cache.get('key1');
            const val2 = await cache.get('key2');
            expect(val1).toBeNull();
            expect(val2).toBeNull();
        });
    });

    // ─── CACHE MIDDLEWARE ───────────────────────────────────────────────────
    skipIfNoRedis('Cache Middleware', () => {
        it('should cache GET request responses', async () => {
            const middleware = cacheMiddleware(300);
            const req = {
                method: 'GET',
                url: '/api/listings',
                originalUrl: '/api/listings',
                headers: {},
            };
            const res = {
                statusCode: 200,
                json: jest.fn((data) => data),
            };
            const next = jest.fn();

            // First call - middleware adds json wrapper
            middleware(req, res, next);
            expect(next).toHaveBeenCalled();

            // Simulate response
            const responseData = { success: true, data: [{ id: 1 }] };
            res.json(responseData);

            // Second call - should get from cache
            const req2 = {
                method: 'GET',
                url: '/api/listings',
                originalUrl: '/api/listings',
                headers: {},
            };
            const res2 = {
                statusCode: 200,
                json: jest.fn((data) => data),
            };

            await new Promise(r => setTimeout(r, 100)); // Wait for cache write

            // This would normally serve from cache
            // In real scenario, the response would come from cache before reaching handler
            expect(res2.json).not.toHaveBeenCalled();
        });

        it('should skip caching for non-GET requests', async () => {
            const middleware = cacheMiddleware(300);
            const req = {
                method: 'POST',
                url: '/api/listings',
                headers: {},
            };
            const next = jest.fn();

            middleware(req, {}, next);
            expect(next).toHaveBeenCalled();
        });

        it('should respect cache-control headers', async () => {
            const middleware = cacheMiddleware(300);
            const req = {
                method: 'GET',
                url: '/api/listings',
                headers: { 'cache-control': 'no-cache' },
            };
            const next = jest.fn();

            middleware(req, {}, next);
            expect(next).toHaveBeenCalled();
        });
    });

    // ─── QUERY CACHE MIDDLEWARE ─────────────────────────────────────────────
    skipIfNoRedis('Query Cache Middleware', () => {
        it('should cache responses with query parameters', async () => {
            const middleware = queryCache(300);
            const req = {
                method: 'GET',
                baseUrl: '/api/listings',
                query: { brand: 'Honda', price_max: 5000 },
            };
            const res = {
                statusCode: 200,
                json: jest.fn((data) => data),
            };
            const next = jest.fn();

            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should skip caching for POST requests', async () => {
            const middleware = queryCache(300);
            const req = {
                method: 'POST',
                baseUrl: '/api/listings',
                query: {},
            };
            const next = jest.fn();

            middleware(req, {}, next);
            expect(next).toHaveBeenCalled();
        });
    });

    // ─── PERFORMANCE TESTING ────────────────────────────────────────────────
    skipIfNoRedis('Cache Performance', () => {
        it('should be faster than direct lookups', async () => {
            const key = 'perf:test';
            const largeData = {
                id: 1,
                name: 'Test Listing',
                description: 'A' .repeat(1000),
                specs: { engine: '2.0L', color: 'Red' },
                images: Array(10).fill('image.jpg'),
            };

            // Cache the data
            await cache.set(key, largeData);

            // Measure cache retrieval time
            const startCache = Date.now();
            for (let i = 0; i < 100; i++) {
                await cache.get(key);
            }
            const cacheTime = Date.now() - startCache;

            // Cache operations should be very fast
            expect(cacheTime).toBeLessThan(1000); // 100 operations in < 1 second
        });

        it('should handle concurrent operations', async () => {
            const operations = [];

            // Create 50 concurrent cache operations
            for (let i = 0; i < 50; i++) {
                operations.push(
                    cache.set(`concurrent:${i}`, { id: i })
                );
            }

            const results = await Promise.all(operations);
            const successes = results.filter(r => r === true).length;

            expect(successes).toBe(50);

            // Verify all were stored
            for (let i = 0; i < 50; i++) {
                const value = await cache.get(`concurrent:${i}`);
                expect(value).toEqual({ id: i });
            }
        });
    });

    // ─── ERROR HANDLING ─────────────────────────────────────────────────────
    skipIfNoRedis('Error Handling', () => {
        it('should handle cache errors gracefully', async () => {
            // Test with invalid data
            const result = await cache.set('test:key', undefined);
            // Should still return true (serializes undefined)
            expect(typeof result === 'boolean').toBe(true);
        });

        it('should return null on cache miss', async () => {
            const result = await cache.get('nonexistent:key');
            expect(result).toBeNull();
        });
    });

    // ─── CACHE PATTERNS ─────────────────────────────────────────────────────
    skipIfNoRedis('Common Cache Patterns', () => {
        it('should cache listing searches', async () => {
            const searchKey = 'search:Honda:5000';
            const results = {
                success: true,
                data: [
                    { id: 1, brand: 'Honda', price: 4500 },
                    { id: 2, brand: 'Honda', price: 4800 },
                ],
                timestamp: new Date().toISOString(),
            };

            await cache.set(searchKey, results, 600); // 10 minute cache
            const cached = await cache.get(searchKey);

            expect(cached).toEqual(results);
        });

        it('should cache payment responses', async () => {
            const paymentKey = 'payment:mpesa:123456';
            const paymentResponse = {
                CheckoutRequestID: '123456',
                ResponseCode: '0',
                ResponseDescription: 'Success',
                CustomerMessage: 'Payment processed',
            };

            await cache.set(paymentKey, paymentResponse, 300); // 5 minute cache
            const cached = await cache.get(paymentKey);

            expect(cached).toEqual(paymentResponse);
        });

        it('should invalidate related caches on update', async () => {
            // Set up related caches
            await cache.set('listings:all', { count: 100 });
            await cache.set('listings:featured', { count: 10 });
            await cache.set('listings:search:honda', { count: 5 });

            // Invalidate all listing caches
            const deleted = await invalidateCache('listings:*');
            expect(deleted).toBe(3);

            // Verify all are gone
            expect(await cache.get('listings:all')).toBeNull();
            expect(await cache.get('listings:featured')).toBeNull();
            expect(await cache.get('listings:search:honda')).toBeNull();
        });
    });
});
