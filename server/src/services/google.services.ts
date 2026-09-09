import * as cheerio from "cheerio";

import { getCache, setCache } from "./cache.services";

import { getOrCreateRequest } from "./request-cache.service";

export interface GoogleFinanceData {
  peRatio: number | null;

  latestEarnings: {
    reportDate: string | null;
    fiscalPeriod: string | null;
    reportedEPS: number | null;
    estimatedEPS: number | null;
  } | null;
}

const GOOGLE_CACHE_TTL = 5 * 60;

const GOOGLE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",

  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

  "Accept-Language": "en-US,en;q=0.9",
};

const EMPTY_GOOGLE_DATA: GoogleFinanceData = {
  peRatio: null,
  latestEarnings: null,
};

const parseNumber = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }

  const normalized = value
    .replace(/,/g, "")
    .replace(/[₹$€£]/g, "")
    .trim();

  const match = normalized.match(/-?\d+(?:\.\d+)?/);

  if (!match) {
    return null;
  }

  const number = Number(match[0]);

  return Number.isFinite(number) ? number : null;
};

const buildGoogleSymbol = (
  exchangeCode: string,
  exchange: "NSE" | "BSE",
): string => {
  const googleExchange = exchange === "NSE" ? "NSE" : "BOM";

  return `${exchangeCode}:${googleExchange}`;
};

const extractStats = ($: cheerio.CheerioAPI): Record<string, string> => {
  const stats: Record<string, string> = {};

  $(".gyFHrc").each((_, element) => {
    const key = $(element).find(".mfs7Fc").first().text().trim().toLowerCase();

    const value = $(element).find(".P6K39c").first().text().trim();

    if (key && value) {
      stats[key] = value;
    }
  });

  return stats;
};

const extractLatestEarnings = (
  $: cheerio.CheerioAPI,
): GoogleFinanceData["latestEarnings"] => {
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  const reportMatch = bodyText.match(
    /Last report\s+([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/,
  );

  const fiscalMatch = bodyText.match(/Fiscal period\s+([A-Z]\d\s+\d{4})/);

  const epsMatch = bodyText.match(
    /EPS\s*\/\s*Est\.?\s*(?:\([A-Z]{3}\))?\s+([₹$€£]?\s*[-\d.,]+)\s*\/\s*([₹$€£]?\s*[-\d.,]+)/,
  );

  if (!reportMatch && !fiscalMatch && !epsMatch) {
    return null;
  }

  return {
    reportDate: reportMatch?.[1] ?? null,

    fiscalPeriod: fiscalMatch?.[1] ?? null,

    reportedEPS: parseNumber(epsMatch?.[1]),

    estimatedEPS: parseNumber(epsMatch?.[2]),
  };
};

const fetchGoogleFinance = async (
  googleSymbol: string,
): Promise<GoogleFinanceData> => {
  const url =
    `https://www.google.com/finance/quote/` + encodeURIComponent(googleSymbol);

  const response = await fetch(url, {
    headers: GOOGLE_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Google Finance returned ${response.status}`);
  }

  const html = await response.text();

  const $ = cheerio.load(html);

  const stats = extractStats($);

  const peRatio = parseNumber(stats["p/e ratio"]);

  const latestEarnings = extractLatestEarnings($);

  return {
    peRatio,

    latestEarnings,
  };
};

export const getBatchGoogleFinance = async (
  holdings: Array<{
    exchangeCode: string;
    exchange: "NSE" | "BSE";
  }>,
): Promise<Map<string, GoogleFinanceData>> => {
  const result = new Map<string, GoogleFinanceData>();

  const uniqueHoldings = Array.from(
    new Map(
      holdings.map((holding) => [
        `${holding.exchange}:${holding.exchangeCode}`,
        holding,
      ]),
    ).values(),
  );

  await Promise.all(
    uniqueHoldings.map(async (holding) => {
      const mapKey = `${holding.exchange}:${holding.exchangeCode}`;

      const cacheKey = `google:finance:${mapKey}`;

      const cached = await getCache<GoogleFinanceData>(cacheKey);

      if (cached !== null) {
        result.set(mapKey, cached);

        return;
      }

      try {
        const googleSymbol = buildGoogleSymbol(
          holding.exchangeCode,
          holding.exchange,
        );
        const data = await getOrCreateRequest(
          `google:finance:${googleSymbol}`,
          () => fetchGoogleFinance(googleSymbol),
        );
        await setCache(cacheKey, data, GOOGLE_CACHE_TTL);

        result.set(mapKey, data);
      } catch (error) {
        console.error(`[Google Finance] Failed for ${mapKey}`, error);

        result.set(mapKey, EMPTY_GOOGLE_DATA);
      }
    }),
  );

  return result;
};
