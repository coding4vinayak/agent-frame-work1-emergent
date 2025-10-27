
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export async function initializeRedis() {
  await redisClient.connect();
  console.log('Redis connected successfully');
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export { redisClient };
