import rateLimit from 'express-rate-limit';
import { getRedisClient } from '../config/redis.js';

const createRateLimiter = (windowMs, max) => {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    return rateLimit({
      windowMs: windowMs,
      max: max,
      standardHeaders: true,
      legacyHeaders: false,
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
      },
      message: 'Too many requests from this IP, please try again later'
    });
  } else {
    return rateLimit({
      windowMs: windowMs,
      max: max,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests from this IP, please try again later'
    });
  }
};

const rateLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);

export const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5);

export const uploadRateLimiter = createRateLimiter(60 * 60 * 1000, 10);

export const profileRateLimiter = createRateLimiter(1 * 60 * 1000, 30);

export default rateLimiter;
