import redisClient from "../config/redis";

const DEFAULT_TTL = 15;

const isReady = (): boolean => {
  return redisClient.isReady;
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!isReady()) {
    return null;
  }

  try {
    const cachedData = await redisClient.get(key);

    if (!cachedData) {
      return null;
    }

    return JSON.parse(cachedData) as T;
  } catch (error) {
    console.error(`[Redis] Failed to read cache for ${key}:`, error);

    return null;
  }
};

export const setCache = async <T>(
  key: string,
  data: T,
  ttl = DEFAULT_TTL,
): Promise<void> => {
  if (!isReady()) {
    return;
  }

  try {
    await redisClient.set(key, JSON.stringify(data), {
      EX: ttl,
    });
  } catch (error) {
    console.error(`[Redis] Failed to write cache for ${key}:`, error);
  }
};
