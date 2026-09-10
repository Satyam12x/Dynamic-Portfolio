import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import portfolioRoutes from "./routes/portfolio";
import { connectRedis, disconnectRedis } from "./config/redis";
import { errorHandler, notFound } from "./middlewares/errorHandler";

const app = express();

const port = Number(process.env.PORT) || 5000;

const host = "0.0.0.0";

const dbLink = process.env.DB_LINK;

const DB_TIMEOUT = 10000;

if (!dbLink) {
  console.error("DB_LINK is missing in .env");

  process.exit(1);
}

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter((origin) => origin.length > 0);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed`));
    },
  }),
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/portfolio", portfolioRoutes);

app.use(notFound);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectRedis();

    await mongoose.connect(dbLink, {
      serverSelectionTimeoutMS: DB_TIMEOUT,
    });

    console.log("Connected to database");

    const server = app.listen(port, host, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`${signal} received, shutting down`);

      server.close();

      await disconnectRedis();

      await mongoose.connection.close();

      process.exit(0);
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));

    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
};

startServer();
