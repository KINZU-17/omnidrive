const Redis = require('ioredis');
const logger = require('./logger');

/**
 * Redis client configuration
 * Supports both local and cloud Redis instances
 */
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    enableReadyCheck: false,
    enableOfflineQueue: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
});

redis.on('connect', () => {
    logger.info('Redis connected', { host: process.env.REDIS_HOST || 'localhost' });
});

redis.on('error', (err) => {
    logger.error('Redis connection error', { error: err.message });
});

redis.on('ready', () => {
    logger.info('Redis ready for commands');
});

/**
 * Cache helper functions
 */
const cache = {
    /**
     * Get value from cache
     */
    async get(key) {
        try {
            if (!redis.status || redis.status === 'close') {
                return null;
            }
            const value = await redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.warn('Cache get error', { key, error: error.message });
            return null;
        }
    },

    /**
     * Set value in cache with TTL
     */
    async set(key, value, ttl = 3600) {
        try {
            if (!redis.status || redis.status === 'close') {
                return false;
            }
            if (ttl) {
                await redis.setex(key, ttl, JSON.stringify(value));
            } else {
                await redis.set(key, JSON.stringify(value));
            }
            return true;
        } catch (error) {
            logger.warn('Cache set error', { key, error: error.message });
            return false;
        }
    },

    /**
     * Delete cache key
     */
    async del(key) {
        try {
            if (!redis.status || redis.status === 'close') {
                return false;
            }
            await redis.del(key);
            return true;
        } catch (error) {
            logger.warn('Cache del error', { key, error: error.message });
            return false;
        }
    },

    /**
     * Delete multiple keys by pattern
     */
    async delPattern(pattern) {
        try {
            if (!redis.status || redis.status === 'close') {
                return 0;
            }
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                return await redis.del(...keys);
            }
            return 0;
        } catch (error) {
            logger.warn('Cache delPattern error', { pattern, error: error.message });
            return 0;
        }
    },

    /**
     * Increment counter
     */
    async increment(key, ttl = 3600) {
        try {
            if (!redis.status || redis.status === 'close') {
                return 0;
            }
            const value = await redis.incr(key);
            if (value === 1 && ttl) {
                await redis.expire(key, ttl);
            }
            return value;
        } catch (error) {
            logger.warn('Cache increment error', { key, error: error.message });
            return 0;
        }
    },

    /**
     * Get all stats
     */
    async getStats() {
        try {
            if (!redis.status || redis.status === 'close') {
                return null;
            }
            const info = await redis.info('stats');
            return info;
        } catch (error) {
            logger.warn('Cache stats error', { error: error.message });
            return null;
        }
    },

    /**
     * Clear all cache
     */
    async flush() {
        try {
            if (!redis.status || redis.status === 'close') {
                return false;
            }
            await redis.flushdb();
            logger.info('Redis cache flushed');
            return true;
        } catch (error) {
            logger.warn('Cache flush error', { error: error.message });
            return false;
        }
    },
};

/**
 * Connect to Redis
 */
async function connectRedis() {
    try {
        await redis.connect();
        logger.info('Redis client connected');
        return true;
    } catch (error) {
        logger.error('Failed to connect to Redis', { error: error.message });
        logger.warn('Continuing without Redis caching');
        return false;
    }
}

module.exports = {
    redis,
    cache,
    connectRedis,
};
