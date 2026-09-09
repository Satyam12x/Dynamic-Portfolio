import { Request, Response } from "express";

import { getPortfolioData } from "../services/portfolio.service";

export const getPortfolio = async (_req: Request, res: Response) => {
  try {
    const portfolio = await getPortfolioData();

    return res.json(portfolio);
  } catch (error) {
    console.error("Error fetching portfolio:", error);

    return res.status(500).json({
      message: "Failed to fetch portfolio",
    });
  }
};
