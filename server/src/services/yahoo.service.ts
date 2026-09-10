import YahooFinance from "yahoo-finance2";

import { getCache, setCache } from "./cache.service";

import { getOrCreateRequest } from "./request-cache.service";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

const MAX_REASONABLE_PRICE = 1_000_000;

const QUOTE_CACHE_TTL = 15;

export type QuoteData = {
  price: number;
  peRatio: number | null;
  latestEarnings: number | null;
  earningsDate: string | null;
};

const isValidPrice = (price: unknown): price is number => {
  return (
    typeof price === "number" &&
    Number.isFinite(price) &&
    price > 0 &&
    price < MAX_REASONABLE_PRICE
  );
};

const toPositiveNumber = (value: unknown): number | null => {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
};

const toFiniteNumber = (value: unknown): number | null => {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const toIsoDate = (value: unknown): string | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString();
  }

  return null;
};

const fetchMissingQuotes = async (
  symbols: string[],
): Promise<Map<string, QuoteData>> => {
  const quoteMap = new Map<string, QuoteData>();

  if (symbols.length === 0) {
    return quoteMap;
  }

  try {
    const quotes = await yahooFinance.quote(symbols);

    for (const quote of quotes) {
      const symbol = quote.symbol;

      if (!symbol) {
        continue;
      }

      if (!isValidPrice(quote.regularMarketPrice)) {
        console.warn(
          `[Yahoo] Invalid price for ${symbol}:`,
          quote.regularMarketPrice,
        );

        continue;
      }

      const data: QuoteData = {
        price: quote.regularMarketPrice,
        peRatio: toPositiveNumber(quote.trailingPE),
        latestEarnings: toFiniteNumber(quote.epsTrailingTwelveMonths),
        earningsDate: toIsoDate(quote.earningsTimestamp),
      };

      quoteMap.set(symbol, data);

      await setCache(`yahoo:quote:${symbol}`, data, QUOTE_CACHE_TTL);
    }
  } catch (error) {
    console.error("[Yahoo] Failed to fetch quotes:", error);
  }

  return quoteMap;
};

export const getBatchQuotes = async (
  symbols: string[],
): Promise<Map<string, QuoteData>> => {
  const quoteMap = new Map<string, QuoteData>();

  const uniqueSymbols = [
    ...new Set(
      symbols
        .filter(
          (symbol): symbol is string =>
            typeof symbol === "string" && symbol.trim().length > 0,
        )
        .map((symbol) => symbol.trim()),
    ),
  ];

  if (uniqueSymbols.length === 0) {
    return quoteMap;
  }

  const missingSymbols: string[] = [];

  for (const symbol of uniqueSymbols) {
    const cached = await getCache<QuoteData>(`yahoo:quote:${symbol}`);

    if (cached !== null) {
      quoteMap.set(symbol, cached);
    } else {
      missingSymbols.push(symbol);
    }
  }

  if (missingSymbols.length === 0) {
    return quoteMap;
  }

  const fetched = await getOrCreateRequest(
    `yahoo:quotes:${[...missingSymbols].sort().join(",")}`,
    () => fetchMissingQuotes(missingSymbols),
  );

  for (const [symbol, data] of fetched) {
    quoteMap.set(symbol, data);
  }

  return quoteMap;
};
