import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

const MAX_REASONABLE_PRICE = 1_000_000;

const isValidPrice = (price: unknown): price is number => {
  return (
    typeof price === "number" &&
    Number.isFinite(price) &&
    price > 0 &&
    price < MAX_REASONABLE_PRICE
  );
};

export const getBatchPrices = async (
  symbols: string[],
): Promise<Map<string, number>> => {
  const priceMap = new Map<string, number>();

  if (symbols.length === 0) {
    return priceMap;
  }

  const uniqueSymbols = [...new Set(symbols)];

  try {
    const quotes = await yahooFinance.quote(uniqueSymbols);

    for (const quote of quotes) {
      const symbol = quote.symbol;
      const price = quote.regularMarketPrice;

      if (!symbol) {
        continue;
      }

      if (!isValidPrice(price)) {
        console.warn(
          `[Yahoo] Invalid price for ${symbol}:`,
          price,
        );

        continue;
      }

      priceMap.set(symbol, price);
    }
  } catch (error) {
    console.error("[Yahoo] Failed to fetch quotes:", error);
  }

  return priceMap;
};