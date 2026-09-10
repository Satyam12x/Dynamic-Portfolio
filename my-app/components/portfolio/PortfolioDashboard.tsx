"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { PortfolioSummary } from "./PortfolioSummary";
import { SectorAllocation } from "./SectorAllocation";
import { SectorPerformance } from "./SectorPerformance";
import { PortfolioTable } from "./PortfolioTable";

export const PortfolioDashboard = () => {
  const { data, error, isLoading, isRefreshing, lastUpdated, refresh } =
    usePortfolio();

  return (
    <div className="mx-auto w-full max-w-[1560px] space-y-5 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Portfolio Dashboard</h1>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Live prices refresh every 15 seconds
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          {isRefreshing ? (
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-green-500"
              aria-hidden
            />
          ) : null}

          <span>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString("en-IN")}`
              : "Loading"}
          </span>
        </div>
      </header>

      {error ? (
        <ErrorBanner
          message={error}
          isStale={data !== null}
          onRetry={refresh}
        />
      ) : null}

      {isLoading && data === null ? <TableSkeleton /> : null}

      {data ? (
        <>
          <PortfolioSummary portfolio={data} />

          {!data.isComplete ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              {data.totalHoldings - data.pricedHoldings} of{" "}
              {data.totalHoldings} holdings have no live price. Totals cover the{" "}
              {data.pricedHoldings} that do.
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <SectorAllocation
              sectors={data.sectors}
              totalInvestment={data.totalInvestment}
            />

            <SectorPerformance sectors={data.sectors} />
          </div>

          <PortfolioTable sectors={data.sectors} />
        </>
      ) : null}

      {!isLoading && data === null && !error ? (
        <p className="text-sm text-zinc-500">No holdings found.</p>
      ) : null}
    </div>
  );
};
