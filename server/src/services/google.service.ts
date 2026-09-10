import * as cheerio from "cheerio";

import { getCache, setCache } from "./cache.service";

import { getOrCreateRequest } from "./request-cache.service";

export type GoogleFinanceData = {
  peRatio: number | null;
  latestEarnings: number | null;
  earningsDate: string | null;
};

const GOOGLE_CACHE_TTL = 5 * 60;

const MAX_CONCURRENT_REQUESTS = 4;

const STAT_ROW_CLASS = ".KxsRFb";

const GOOGLE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

const EMPTY_DATA: GoogleFinanceData = {
  peRatio: null,
  latestEarnings: null,
  earningsDate: null,
};

const parseNumber = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/,/g, "").replace(/[₹$€£]/g, "").trim();

  const match = normalized.match(/-?\d+(?:\.\d+)?/);

  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);

  return Number.isFinite(parsed) ? parsed : null;
};

export const buildGoogleSymbol = (
  exchangeCode: string,
  exchange: "NSE" | "BSE",
): string => {
  return `${exchangeCode}:${exchange === "NSE" ? "NSE" : "BOM"}`;
};

const readStatsByClass = ($: cheerio.CheerioAPI): Map<string, string> => {
  const stats = new Map<string, string>();

  $(STAT_ROW_CLASS).each((_, element) => {
    const children = $(element).children();

    const label = children.first().text().trim().toLowerCase();
    const value = children.eq(1).text().trim();

    if (label && value && !stats.has(label)) {
      stats.set(label, value);
    }
  });

  return stats;
};

const readStatsByLabel = ($: cheerio.CheerioAPI): Map<string, string> => {
  const stats = new Map<string, string>();

  $("div").each((_, element) => {
    const node = $(element);

    if (node.children().length > 0) {
      return;
    }

    const label = node.text().trim().toLowerCase();

    if (!label || label.length > 30 || stats.has(label)) {
      return;
    }

    const value = node.next().text().trim();

    if (value) {
      stats.set(label, value);
    }
  });

  return stats;
};

const readStats = (
  $: cheerio.CheerioAPI,
  googleSymbol: string,
): Map<string, string> => {
  const byClass = readStatsByClass($);

  if (byClass.size > 0) {
    return byClass;
  }

  const byLabel = readStatsByLabel($);

  if (byLabel.size > 0) {
    console.warn(
      `[Google] "${STAT_ROW_CLASS}" matched nothing for ${googleSymbol}, used label fallback. Google likely changed its markup.`,
    );

    return byLabel;
  }

  console.warn(
    `[Google] Could not read any stats for ${googleSymbol}. Both selectors failed.`,
  );

  return byLabel;
};

const readEarningsDate = ($: cheerio.CheerioAPI): string | null => {
  const text = $("body").text().replace(/\s+/g, " ");

  const match = text.match(/Last report\s*([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/);

  if (!match) {
    return null;
  }

  const parsed = new Date(match[1]);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const fetchGoogleFinance = async (
  googleSymbol: string,
): Promise<GoogleFinanceData> => {
  const url = `https://www.google.com/finance/quote/${encodeURIComponent(googleSymbol)}`;

  const response = await fetch(url, { headers: GOOGLE_HEADERS });

  if (!response.ok) {
    throw new Error(`Google Finance returned ${response.status}`);
  }

  const $ = cheerio.load(await response.text());

  const stats = readStats($, googleSymbol);

  return {
    peRatio: parseNumber(stats.get("p/e ratio")),
    latestEarnings: parseNumber(stats.get("eps")),
    earningsDate: readEarningsDate($),
  };
};

const mapWithLimit = async <T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(items.length);

  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    (async () => {
      while (cursor < items.length) {
        const index = cursor;

        cursor += 1;

        results[index] = await task(items[index]);
      }
    })(),
  );

  await Promise.all(workers);

  return results;
};

export const getBatchGoogleFinance = async (
  holdings: Array<{ exchangeCode: string; exchange: "NSE" | "BSE" }>,
): Promise<Map<string, GoogleFinanceData>> => {
  const result = new Map<string, GoogleFinanceData>();

  const unique = Array.from(
    new Map(
      holdings.map((holding) => [
        buildGoogleSymbol(holding.exchangeCode, holding.exchange),
        holding,
      ]),
    ).keys(),
  );

  await mapWithLimit(unique, MAX_CONCURRENT_REQUESTS, async (googleSymbol) => {
    const cacheKey = `google:finance:${googleSymbol}`;

    const cached = await getCache<GoogleFinanceData>(cacheKey);

    if (cached !== null) {
      result.set(googleSymbol, cached);

      return;
    }

    try {
      const data = await getOrCreateRequest(cacheKey, () =>
        fetchGoogleFinance(googleSymbol),
      );

      await setCache(cacheKey, data, GOOGLE_CACHE_TTL);

      result.set(googleSymbol, data);
    } catch (error) {
      console.error(
        `[Google] Failed for ${googleSymbol}:`,
        (error as Error).message,
      );

      result.set(googleSymbol, EMPTY_DATA);
    }
  });

  return result;
};
