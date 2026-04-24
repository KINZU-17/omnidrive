const { cache } = require('../config/redis');
const logger = require('../config/logger');

/**
 * Middleware to cache GET requests
 * Usage: app.get('/endpoint', cacheMiddleware(300), handler)
 * where 300 is TTL in seconds
 */
function cacheMiddleware(ttl = 300) {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Skip cache if no-cache header
        if (req.headers['cache-control'] === 'no-cache') {
            return next();
        }

        const cacheKey = `route:${req.method}:${req.originalUrl || req.url}`;

        try {
            // Try to get from cache
            const cachedResponse = await cache.get(cacheKey);
            if (cachedResponse) {
                logger.debug('Cache hit', { key: cacheKey, ttl });
                return res.json(cachedResponse);
            }
        } catch (error) {
            logger.warn('Cache retrieval error', { key: cacheKey, error: error.message });
            // Continue without cache on error
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json to cache successful responses
        res.json = function(data) {
            // Only cache successful responses (2xx status)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache.set(cacheKey, data, ttl).catch(error => {
                    logger.warn('Cache set error on response', { key: cacheKey, error: error.message });
                });
            }
            return originalJson(data);
        };

        next();
    };
}

/**
 * Middleware to cache API responses with query parameters
 * Useful for search/filter endpoints
 */
function queryCache(ttl = 300) {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        // Create cache key from URL + query params
        const queryString = Object.keys(req.query)
            .sort()
            .map(key => `${key}=${req.query[key]}`)
            .join('&');

        const cacheKey = `query:${req.baseUrl}?${queryString}`;

        try {
            const cached = await cache.get(cacheKey);
            if (cached) {
                logger.debug('Query cache hit', { key: cacheKey });
                return res.json(cached);
            }
        } catch (error) {
            logger.warn('Query cache retrieval error', { error: error.message });
        }

        const originalJson = res.json.bind(res);

        res.json = function(data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache.set(cacheKey, data, ttl).catch(error => {
                    logger.warn('Query cache set error', { error: error.message });
                });
            }
            return originalJson(data);
        };

        next();
    };
}

/**
 * Invalidate cache for a pattern
 * Usage: await invalidateCache('listings:*')
 */
async function invalidateCache(pattern) {
    try {
        const deleted = await cache.delPattern(pattern);
        logger.info('Cache invalidated', { pattern, count: deleted });
        return deleted;
    } catch (error) {
        logger.error('Cache invalidation error', { pattern, error: error.message });
        return 0;
    }
}

/**
 * Middleware to provide cache control functions to route handlers
 */
function cacheFunctions(req, res, next) {
    res.cache = {
        async set(key, value, ttl = 300) {
            return await cache.set(key, value, ttl);
        },
        async get(key) {
            return await cache.get(key);
        },
        async invalidate(pattern) {
            return await invalidateCache(pattern);
        },
    };
    next();
}

module.exports = {
    cacheMiddleware,
    queryCache,
    invalidateCache,
    cacheFunctions,
};
