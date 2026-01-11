import redis from 'redis';

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
    });

    redisClient.on('connect', () => {
    });

    await redisClient.connect();
  } catch (error) {
  }
};

export const getRedisClient = () => redisClient;

export default connectRedis;
