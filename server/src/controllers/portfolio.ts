import { Request, Response } from "express";
import Stock from "../models/holding";

export const getPortfolio = async (_req: Request, res: Response) => {
  try {
    const holdings = await Stock.find().lean();

    let totalInvestment = 0;

    const calculatedHoldings = holdings.map((holding) => {
      const investment = holding.purchasePrice * holding.quantity;

      totalInvestment += investment;

      return {
        name: holding.name,
        purchasePrice: holding.purchasePrice,
        quantity: holding.quantity,
        investment,
        portfolioPercent: 0,
        exchange: holding.exchange,
        exchangeCode: holding.exchangeCode,
        cmp: null,
        presentValue: null,
        gainLoss: null,
        peRatio: null,
        latestEarnings: null,
        sector: holding.sector,
      };
    });

    const holdingsWithPercent = calculatedHoldings.map((holding) => ({
      ...holding,
      portfolioPercent:
        totalInvestment === 0
          ? 0
          : Number(
              ((holding.investment / totalInvestment) * 100).toFixed(2)
            ),
    }));

    const sectorMap = holdingsWithPercent.reduce(
      (acc, holding) => {
        const { sector } = holding;

        if (!acc[sector]) {
          acc[sector] = {
            sector,
            totalInvestment: 0,
            holdings: [],
          };
        }

        acc[sector].totalInvestment += holding.investment;
        acc[sector].holdings.push(holding);

        return acc;
      },
      {} as Record<
        string,
        {
          sector: string;
          totalInvestment: number;
          holdings: typeof holdingsWithPercent;
        }
      >
    );

    const sectors = Object.values(sectorMap);

    return res.json({
      totalInvestment,
      sectors,
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);

    return res.status(500).json({
      message: "Failed to fetch portfolio",
    });
  }
};
