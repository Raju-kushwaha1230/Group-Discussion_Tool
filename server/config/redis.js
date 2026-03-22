const Redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    // Using default local Redis port if env variable is missing
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => console.log('Redis Client Error (will fallback to memory):', err.message));
    
    try {
      await redisClient.connect();
      console.log('Redis Connected');
    } catch (e) {
      console.log('Could not establish initial Redis connection. Continuing without Redis.');
      redisClient = null; // nullify so we know it's not working
    }
    return redisClient;
  } catch (error) {
    console.error(`Error connecting to Redis: ${error.message}`);
    redisClient = null;
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
