import { Request, Response } from "express";
import Stock from "../models/holding";
import { getBatchPrices } from "../services/yahoo.services";

export const getPortfolio = async (
  _req: Request,
  res: Response,
) => {
  try {
    const holdings = await Stock.find().lean();
    const symbols = holdings
      .map((holding) => holding.yahooSymbol)
      .filter(
        (symbol): symbol is string =>
          typeof symbol === "string" &&
          symbol.length > 0,
      );

    const priceMap = await getBatchPrices(symbols);

    let totalInvestment = 0;

    const calculatedHoldings = holdings.map((holding) => {
      const investment =
        holding.purchasePrice * holding.quantity;

      totalInvestment += investment;

      const cmp =
        holding.yahooSymbol
          ? priceMap.get(holding.yahooSymbol) ?? null
          : null;

      const presentValue =
        cmp === null
          ? null
          : cmp * holding.quantity;

      const gainLoss =
        presentValue === null
          ? null
          : presentValue - investment;

      return {
        name: holding.name,
        purchasePrice: holding.purchasePrice,
        quantity: holding.quantity,

        investment,

        portfolioPercent: 0,

        exchange: holding.exchange,
        exchangeCode: holding.exchangeCode,

        yahooSymbol: holding.yahooSymbol ?? null,

        cmp,
        presentValue,
        gainLoss,

        peRatio: null,
        latestEarnings: null,

        sector: holding.sector,
      };
    });

    const holdingsWithPercent =
      calculatedHoldings.map((holding) => ({
        ...holding,

        portfolioPercent:
          totalInvestment === 0
            ? 0
            : Number(
                (
                  (holding.investment /
                    totalInvestment) *
                  100
                ).toFixed(2),
              ),
      }));

    const sectorMap = holdingsWithPercent.reduce(
      (acc, holding) => {
        const { sector } = holding;

        if (!acc[sector]) {
          acc[sector] = {
            sector,
            totalInvestment: 0,
            pricedInvestment: 0,
            totalPresentValue: 0,
            totalGainLoss: 0,

            totalHoldings: 0,
            pricedHoldings: 0,

            holdings: [],
          };
        }

        acc[sector].totalInvestment +=
          holding.investment;

        acc[sector].totalHoldings += 1;
        if (holding.presentValue !== null) {
          acc[sector].totalPresentValue +=
            holding.presentValue;

          acc[sector].totalGainLoss +=
            holding.gainLoss ?? 0;

          acc[sector].pricedInvestment +=
            holding.investment;

          acc[sector].pricedHoldings += 1;
        }

        acc[sector].holdings.push(holding);

        return acc;
      },
      {} as Record<
        string,
        {
          sector: string;
          totalInvestment: number;
          pricedInvestment: number;
          totalPresentValue: number;
          totalGainLoss: number;
          totalHoldings: number;
          pricedHoldings: number;
          holdings: typeof holdingsWithPercent;
        }
      >,
    );

    const sectors = Object.values(sectorMap);

    const pricedHoldings =
      calculatedHoldings.filter(
        (holding) =>
          holding.presentValue !== null,
      );

    const totalPresentValue =
      pricedHoldings.length === 0
        ? null
        : pricedHoldings.reduce(
            (sum, holding) =>
              sum + (holding.presentValue ?? 0),
            0,
          );

    const pricedInvestment = pricedHoldings.reduce(
      (sum, holding) => sum + holding.investment,
      0,
    );

    const totalGainLoss =
      pricedHoldings.length === 0
        ? null
        : pricedHoldings.reduce(
            (sum, holding) =>
              sum + (holding.gainLoss ?? 0),
            0,
          );

    return res.json({
      totalInvestment,

      pricedInvestment,

      totalPresentValue,

      totalGainLoss,

      totalHoldings: holdings.length,

      pricedHoldings: pricedHoldings.length,

      isComplete:
        pricedHoldings.length === holdings.length,

      sectors,
    });
  } catch (error) {
    console.error(
      "Error fetching portfolio:",
      error,
    );

    return res.status(500).json({
      message: "Failed to fetch portfolio",
    });
  }
};