import rateLimit from 'express-rate-limit';
import { getRedisClient } from '../config/redis.js';

const createRateLimiter = (windowMs, max, skipSuccessfulRequests = false) => {
  const redisClient = getRedisClient();
  
  // In development, allow bypassing rate limit if DISABLE_RATE_LIMIT is set
  if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_RATE_LIMIT === 'true') {
    return (req, res, next) => next(); // Skip rate limiting
  }
  
  const baseConfig = {
    windowMs: windowMs,
    max: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later',
    skipSuccessfulRequests: skipSuccessfulRequests,
    // Disable trust proxy validation since we're behind a trusted proxy (Render)
    // We set trust proxy to 1 in server.js to only trust the first proxy
    validate: {
      trustProxy: false
    }
  };
  
  if (redisClient) {
    return rateLimit({
      ...baseConfig,
      store: {
        async incr(key, cb) {
          try {
            const count = await redisClient.incr(key);
            if (count === 1) {
              await redisClient.expire(key, Math.ceil(windowMs / 1000));
            }
            cb(null, count);
          } catch (err) {
            cb(err);
          }
        },
        async decrement(key) {
          await redisClient.decr(key);
        },
        async resetKey(key) {
          await redisClient.del(key);
        }
      }
    });
  } else {
    return rateLimit(baseConfig);
  }
};

const rateLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);

// Auth rate limiter - more lenient in development
const authWindowMs = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const authMaxRequests = parseInt(process.env.AUTH_RATE_LIMIT_MAX) || (process.env.NODE_ENV === 'production' ? 5 : 20);
export const authRateLimiter = createRateLimiter(authWindowMs, authMaxRequests);

export const uploadRateLimiter = createRateLimiter(60 * 60 * 1000, 10);

export const profileRateLimiter = createRateLimiter(1 * 60 * 1000, 30);

export default rateLimiter;
