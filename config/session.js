const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { redis } = require('../config/redis');
const logger = require('../config/logger');

/**
 * Configure express-session with Redis store
 * Provides secure session management for user authentication
 */
function configureSessionStore() {
    const redisStore = new RedisStore({
        client: redis,
        prefix: 'session:',
        ttl: 24 * 60 * 60, // 24 hours in seconds
    });

    const sessionConfig = {
        store: redisStore,
        secret: process.env.SESSION_SECRET || 'omnidrive-secret-key',
        resave: false,
        saveUninitialized: false,
        name: 'omnidrive.sid',
        cookie: {
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            sameSite: 'lax',
        },
    };

    logger.info('Session store configured with Redis', {
        ttl: sessionConfig.cookie.maxAge,
        secure: sessionConfig.cookie.secure,
    });

    return session(sessionConfig);
}

module.exports = {
    configureSessionStore,
};
