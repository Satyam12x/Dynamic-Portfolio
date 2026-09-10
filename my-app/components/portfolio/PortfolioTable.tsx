"use client";

import { useState } from "react";
import type { SortingState } from "@tanstack/react-table";

import { portfolioColumns, columnAlign } from "./columns";
import { SectorGroup } from "./SectorGroup";
import type { PortfolioSector } from "@/types/portfolio";

type PortfolioTableProps = {
  sectors: PortfolioSector[];
};

const columnId = (column: (typeof portfolioColumns)[number], index: number) =>
  "accessorKey" in column ? String(column.accessorKey) : String(index);

export const PortfolioTable = ({ sectors }: PortfolioTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const toggleSort = (id: string) => {
    setSorting((current) => {
      const active = current[0];

      if (!active || active.id !== id) {
        return [{ id, desc: true }];
      }

      if (active.desc) {
        return [{ id, desc: false }];
      }

      return [];
    });
  };

  const active = sorting[0];

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[1100px] border-collapse">
        <thead className="bg-zinc-50 dark:bg-zinc-950">
          <tr>
            {portfolioColumns.map((column, index) => {
              const id = columnId(column, index);
              const isActive = active?.id === id;
              const isLeft = columnAlign[id] === "left";

              return (
                <th
                  key={id}
                  scope="col"
                  aria-sort={
                    isActive
                      ? active.desc
                        ? "descending"
                        : "ascending"
                      : "none"
                  }
                  className={`whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide ${
                    isLeft ? "text-left" : "text-right"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(id)}
                    className={`inline-flex w-full items-center gap-1 uppercase transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 ${
                      isLeft ? "justify-start" : "justify-end"
                    } ${
                      isActive
                        ? "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {String(column.header)}

                    <span aria-hidden className="text-[10px] leading-none">
                      {isActive ? (active.desc ? "\u25bc" : "\u25b2") : ""}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>

        {sectors.map((sector) => (
          <SectorGroup
            key={sector.sector}
            sector={sector}
            sorting={sorting}
          />
        ))}
      </table>
    </div>
  );
};
