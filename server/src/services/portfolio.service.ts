import Stock from "../models/holding";

import { getCache, setCache } from "./cache.service";

import { getBatchQuotes, QuoteData } from "./yahoo.service";

import {
  getBatchGoogleFinance,
  buildGoogleSymbol,
  GoogleFinanceData,
} from "./google.service";

import { getOrCreateRequest } from "./request-cache.service";

const PORTFOLIO_CACHE_KEY = "portfolio:data";

const PORTFOLIO_CACHE_TTL = 15;

type HoldingData = {
  name: string;
  purchasePrice: number;
  quantity: number;
  exchangeCode: string;
  exchange: "NSE" | "BSE";
  sector: "Financial" | "Tech" | "Consumer" | "Power" | "Pipe" | "Others";
  yahooSymbol?: string | null;
};

type PortfolioHolding = {
  name: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercent: number;
  exchange: "NSE" | "BSE";
  exchangeCode: string;
  yahooSymbol: string | null;
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  earningsDate: string | null;
  sector: HoldingData["sector"];
};

type SectorData = {
  sector: string;
  totalInvestment: number;
  pricedInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalHoldings: number;
  pricedHoldings: number;
  holdings: PortfolioHolding[];
};

type PortfolioData = {
  totalInvestment: number;
  pricedInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalHoldings: number;
  pricedHoldings: number;
  isComplete: boolean;
  sectors: SectorData[];
};

const buildPortfolio = (
  holdings: HoldingData[],
  quoteMap: Map<string, QuoteData>,
  googleMap: Map<string, GoogleFinanceData>,
): PortfolioData => {
  let totalInvestment = 0;

  const calculatedHoldings = holdings.map((holding): PortfolioHolding => {
    const investment = holding.purchasePrice * holding.quantity;

    totalInvestment += investment;

    const quote = holding.yahooSymbol
      ? (quoteMap.get(holding.yahooSymbol) ?? null)
      : null;

    const cmp = quote?.price ?? null;

    const google =
      googleMap.get(
        buildGoogleSymbol(holding.exchangeCode, holding.exchange),
      ) ?? null;

    const presentValue = cmp === null ? null : cmp * holding.quantity;

    const gainLoss = presentValue === null ? null : presentValue - investment;

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

      peRatio: google?.peRatio ?? quote?.peRatio ?? null,

      latestEarnings: google?.latestEarnings ?? quote?.latestEarnings ?? null,

      earningsDate: google?.earningsDate ?? quote?.earningsDate ?? null,

      sector: holding.sector,
    };
  });

  const holdingsWithPercent = calculatedHoldings.map((holding) => ({
    ...holding,

    portfolioPercent:
      totalInvestment === 0
        ? 0
        : Number(((holding.investment / totalInvestment) * 100).toFixed(2)),
  }));

  const sectorMap = holdingsWithPercent.reduce(
    (acc: Record<string, SectorData>, holding) => {
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

      acc[sector].totalInvestment += holding.investment;

      acc[sector].totalHoldings += 1;

      if (holding.presentValue !== null) {
        acc[sector].totalPresentValue += holding.presentValue;

        acc[sector].totalGainLoss += holding.gainLoss ?? 0;

        acc[sector].pricedInvestment += holding.investment;

        acc[sector].pricedHoldings += 1;
      }

      acc[sector].holdings.push(holding);

      return acc;
    },
    {},
  );

  const sectors = Object.values(sectorMap);

  const pricedHoldings = calculatedHoldings.filter(
    (holding) => holding.presentValue !== null,
  );

  const totalPresentValue =
    pricedHoldings.length === 0
      ? null
      : pricedHoldings.reduce(
          (sum, holding) => sum + (holding.presentValue ?? 0),
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
          (sum, holding) => sum + (holding.gainLoss ?? 0),
          0,
        );

  return {
    totalInvestment,

    pricedInvestment,

    totalPresentValue,

    totalGainLoss,

    totalHoldings: holdings.length,

    pricedHoldings: pricedHoldings.length,

    isComplete: pricedHoldings.length === holdings.length,

    sectors,
  };
};

export const getPortfolioData = async (): Promise<PortfolioData> => {
  const cachedPortfolio = await getCache<PortfolioData>(PORTFOLIO_CACHE_KEY);

  if (cachedPortfolio !== null) {
    return cachedPortfolio;
  }

  return getOrCreateRequest(PORTFOLIO_CACHE_KEY, async () => {
    const secondCacheCheck = await getCache<PortfolioData>(PORTFOLIO_CACHE_KEY);

    if (secondCacheCheck !== null) {
      return secondCacheCheck;
    }

    const holdings = await Stock.find().lean();
    const symbols = holdings
      .map((holding) => holding.yahooSymbol)
      .filter(
        (symbol): symbol is string =>
          typeof symbol === "string" && symbol.trim().length > 0,
      );

    const [quoteMap, googleMap] = await Promise.all([
      getBatchQuotes(symbols),

      getBatchGoogleFinance(
        holdings.map((holding) => ({
          exchangeCode: holding.exchangeCode,

          exchange: holding.exchange,
        })),
      ),
    ]);

    const portfolio = buildPortfolio(holdings, quoteMap, googleMap);

    await setCache(PORTFOLIO_CACHE_KEY, portfolio, PORTFOLIO_CACHE_TTL);

    return portfolio;
  });
};
