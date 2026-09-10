"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchPortfolio } from "@/lib/api";
import type { Portfolio } from "@/types/portfolio";

const REFRESH_INTERVAL = 15_000;

type PortfolioState = {
  data: Portfolio | null;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
};

export const usePortfolio = (): PortfolioState => {
  const [data, setData] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const hasData = useRef(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (hasData.current) {
      setIsRefreshing(true);
    }

    try {
      const portfolio = await fetchPortfolio(signal);

      if (signal?.aborted) {
        return;
      }

      setData(portfolio);
      setError(null);
      setLastUpdated(new Date());

      hasData.current = true;
    } catch (caught) {
      if (signal?.aborted || (caught as Error).name === "AbortError") {
        return;
      }

      setError((caught as Error).message);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    load(controller.signal);

    const timer = setInterval(() => {
      load(controller.signal);
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return { data, error, isLoading, isRefreshing, lastUpdated, refresh };
};
