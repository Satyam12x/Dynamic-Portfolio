import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import portfolioRoutes from "./routes/portfolio";
import redisClient from "./config/redis";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

const port = Number(process.env.PORT) || 5000;

const dbLink = process.env.DB_LINK;

if (!dbLink) {
  console.error("DB_LINK is missing in .env");

  process.exit(1);
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/portfolio", portfolioRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await redisClient.connect();

    console.log("Redis connected");

    await mongoose.connect(dbLink);

    console.log("Connected to database");

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
};

startServer();
