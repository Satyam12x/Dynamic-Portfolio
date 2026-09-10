import { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(`[${req.method}] ${req.originalUrl}`, error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
