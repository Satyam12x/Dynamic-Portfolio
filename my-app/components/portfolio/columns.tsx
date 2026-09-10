"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  EMPTY,
  formatCurrency,
  formatNumber,
  formatPercent,
  gainLossColor,
} from "@/lib/format";
import { initials, sectorColor } from "@/lib/sectors";
import type { PortfolioHolding } from "@/types/portfolio";

export type Align = "left" | "right";

export const columnAlign: Record<string, Align> = {
  name: "left",
  exchangeCode: "left",
};

export const portfolioColumns: ColumnDef<PortfolioHolding>[] = [
  {
    accessorKey: "name",
    header: "Particulars",
    cell: (info) => {
      const holding = info.row.original;

      return (
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
            style={{ background: sectorColor(holding.sector) }}
          >
            {initials(holding.name)}
          </span>

          <span className="font-medium">{holding.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "purchasePrice",
    header: "Purchase Price",
    cell: (info) => formatCurrency(info.getValue<number>()),
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: (info) => formatNumber(info.getValue<number>()),
  },
  {
    accessorKey: "investment",
    header: "Investment",
    cell: (info) => formatCurrency(info.getValue<number>()),
  },
  {
    accessorKey: "portfolioPercent",
    header: "Portfolio (%)",
    cell: (info) => formatPercent(info.getValue<number>()),
  },
  {
    accessorKey: "exchangeCode",
    header: "NSE/BSE",
    cell: (info) => (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {info.row.original.exchange}
        </span>

        <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
          {info.getValue<string>()}
        </span>
      </span>
    ),
  },
  {
    accessorKey: "cmp",
    header: "CMP",
    cell: (info) => formatCurrency(info.getValue<number | null>()),
  },
  {
    accessorKey: "presentValue",
    header: "Present Value",
    cell: (info) => formatCurrency(info.getValue<number | null>()),
  },
  {
    accessorKey: "gainLoss",
    header: "Gain/Loss",
    cell: (info) => {
      const value = info.getValue<number | null>();
      const { investment } = info.row.original;

      if (value === null) {
        return <span className="text-zinc-500 dark:text-zinc-400">{EMPTY}</span>;
      }

      const percent = investment > 0 ? (value / investment) * 100 : 0;
      const isGain = value >= 0;

      return (
        <span className="inline-flex items-center justify-end gap-2">
          <span className={`font-medium ${gainLossColor(value)}`}>
            {formatCurrency(value)}
          </span>

          <span
            className={`inline-block w-[68px] rounded px-1.5 py-0.5 text-right text-[11px] font-semibold tabular-nums ${
              isGain
                ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
            }`}
          >
            {isGain ? "+" : ""}
            {percent.toFixed(2)}%
          </span>
        </span>
      );
    },
  },
  {
    accessorKey: "peRatio",
    header: "P/E Ratio",
    cell: (info) => formatNumber(info.getValue<number | null>()),
  },
  {
    accessorKey: "latestEarnings",
    header: "Latest Earnings",
    cell: (info) => formatNumber(info.getValue<number | null>()),
  },
];
