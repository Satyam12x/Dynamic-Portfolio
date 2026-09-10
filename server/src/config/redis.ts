import { createClient } from "redis";

const MAX_RETRY_DELAY = 5000;

let hasLoggedError = false;

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 200, MAX_RETRY_DELAY),
  },
});

redisClient.on("error", (error: Error) => {
  if (hasLoggedError) {
    return;
  }

  hasLoggedError = true;

  console.error("Redis unavailable:", error.message);
  console.error("Continuing without cache. Start Redis to enable caching.");
});

redisClient.on("ready", () => {
  hasLoggedError = false;

  console.log("Redis is ready");
});

export default redisClient;
