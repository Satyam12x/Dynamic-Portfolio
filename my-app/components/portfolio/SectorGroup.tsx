"use client";

import { memo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

import { portfolioColumns, columnAlign } from "./columns";
import { formatCurrency, gainLossColor } from "@/lib/format";
import type { PortfolioSector } from "@/types/portfolio";

type SectorGroupProps = {
  sector: PortfolioSector;
  sorting: SortingState;
};

const SectorGroupComponent = ({ sector, sorting }: SectorGroupProps) => {
  const table = useReactTable({
    data: sector.holdings,
    columns: portfolioColumns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    sortDescFirst: true,
  });

  const isPartial = sector.pricedHoldings < sector.totalHoldings;

  return (
    <tbody className="border-b border-zinc-200 dark:border-zinc-800">
      <tr className="bg-zinc-100 dark:bg-zinc-900">
        <th
          colSpan={3}
          scope="colgroup"
          className="px-3 py-2 text-left text-sm font-semibold"
        >
          {sector.sector}

          {isPartial ? (
            <span className="ml-2 font-normal text-xs text-amber-700 dark:text-amber-500">
              {sector.pricedHoldings} of {sector.totalHoldings} priced
            </span>
          ) : null}
        </th>

        <th className="px-3 py-2 text-right text-sm font-semibold">
          {formatCurrency(sector.totalInvestment)}
        </th>

        <th colSpan={3} />

        <th className="px-3 py-2 text-right text-sm font-semibold">
          {formatCurrency(sector.totalPresentValue)}
        </th>

        <th
          className={`px-3 py-2 text-right text-sm font-semibold ${gainLossColor(sector.totalGainLoss)}`}
        >
          {formatCurrency(sector.totalGainLoss)}
        </th>

        <th colSpan={2} />
      </tr>

      {table.getRowModel().rows.map((row) => (
        <tr
          key={row.id}
          className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
        >
          {row.getVisibleCells().map((cell) => (
            <td
              key={cell.id}
              className={`whitespace-nowrap px-3 py-2 text-sm ${
                columnAlign[cell.column.id] === "left"
                  ? "text-left"
                  : "text-right"
              }`}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export const SectorGroup = memo(SectorGroupComponent);
