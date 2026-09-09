import redisClient from "../config/redis";

const DEFAULT_TTL = 15;

export const getCache = async <T>(key: string): Promise<T | null> => {
  const cachedData = await redisClient.get(key);

  if (!cachedData) {
    return null;
  }

  try {
    return JSON.parse(cachedData) as T;
  } catch (error) {
    console.error(`[Redis] Failed to parse cache for ${key}:`, error);

    await redisClient.del(key);

    return null;
  }
};

export const setCache = async <T>(
  key: string,
  data: T,
  ttl = DEFAULT_TTL,
): Promise<void> => {
  await redisClient.set(key, JSON.stringify(data), {
    EX: ttl,
  });
};

export const deleteCache = async (key: string): Promise<void> => {
  await redisClient.del(key);
};
