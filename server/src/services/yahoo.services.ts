import YahooFinance from "yahoo-finance2";

import { getCache, setCache } from "./cache.services";

import { getOrCreateRequest } from "./request-cache.service";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

const MAX_REASONABLE_PRICE = 1_000_000;

const PRICE_CACHE_TTL = 15;

const isValidPrice = (price: unknown): price is number => {
  return (
    typeof price === "number" &&
    Number.isFinite(price) &&
    price > 0 &&
    price < MAX_REASONABLE_PRICE
  );
};

const fetchMissingPrices = async (
  symbols: string[],
): Promise<Map<string, number>> => {
  const priceMap = new Map<string, number>();

  if (symbols.length === 0) {
    return priceMap;
  }

  try {
    const quotes = await yahooFinance.quote(symbols);

    for (const quote of quotes) {
      const symbol = quote.symbol;

      const price = quote.regularMarketPrice;

      if (!symbol) {
        continue;
      }

      if (!isValidPrice(price)) {
        console.warn(`[Yahoo] Invalid price for ${symbol}:`, price);

        continue;
      }

      priceMap.set(symbol, price);

      await setCache(`yahoo:price:${symbol}`, price, PRICE_CACHE_TTL);
    }
  } catch (error) {
    console.error("[Yahoo] Failed to fetch quotes:", error);
  }

  return priceMap;
};

export const getBatchPrices = async (
  symbols: string[],
): Promise<Map<string, number>> => {
  const priceMap = new Map<string, number>();

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
    return priceMap;
  }

  const missingSymbols: string[] = [];

  for (const symbol of uniqueSymbols) {
    const cachedPrice = await getCache<number>(`yahoo:price:${symbol}`);

    if (cachedPrice !== null) {
      priceMap.set(symbol, cachedPrice);
    } else {
      missingSymbols.push(symbol);
    }
  }

  if (missingSymbols.length === 0) {
    return priceMap;
  }

  const fetchedPrices = await getOrCreateRequest(
    `yahoo:prices:${[...missingSymbols].sort().join(",")}`,
    () => fetchMissingPrices(missingSymbols),
  );

  for (const [symbol, price] of fetchedPrices) {
    priceMap.set(symbol, price);
  }

  return priceMap;
};
