import { createClient } from "redis";

const MAX_RETRY_DELAY = 5000;

const MAX_RECONNECT_ATTEMPTS = 20;

const CONNECT_TIMEOUT = 10000;

const redisUrl = process.env.REDIS_URL;

let hasLoggedError = false;

const buildClient = (url: string) => {
  const client = createClient({
    url,
    socket: {
      connectTimeout: CONNECT_TIMEOUT,
      reconnectStrategy: (retries) => {
        if (retries > MAX_RECONNECT_ATTEMPTS) {
          return new Error("Redis unreachable, stopped reconnecting");
        }

        return Math.min(retries * 200, MAX_RETRY_DELAY);
      },
    },
  });

  client.on("error", (error: Error) => {
    if (hasLoggedError) {
      return;
    }

    hasLoggedError = true;

    console.error("Redis unavailable:", error.message);
    console.error("Continuing without cache.");
  });

  client.on("ready", () => {
    hasLoggedError = false;

    console.log("Redis is ready");
  });

  return client;
};

const redisClient = redisUrl ? buildClient(redisUrl) : null;

export const connectRedis = async (): Promise<void> => {
  if (!redisClient) {
    console.log("REDIS_URL is not set, running without cache");

    return;
  }

  try {
    await redisClient.connect();

    console.log("Redis connected");
  } catch {
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient?.isOpen) {
    return;
  }

  try {
    await redisClient.close();
  } catch {
  }
};

export default redisClient;
