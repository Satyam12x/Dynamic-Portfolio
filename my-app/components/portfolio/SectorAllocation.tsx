"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "@/lib/format";
import { sectorColor } from "@/lib/sectors";
import type { PortfolioSector } from "@/types/portfolio";

type SectorAllocationProps = {
  sectors: PortfolioSector[];
  totalInvestment: number;
};

type Slice = {
  sector: string;
  value: number;
  share: number;
};

const AllocationTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: Slice }[];
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const slice = payload[0].payload;

  if (!slice) {
    return null;
  }

  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <p className="font-medium">{slice.sector}</p>

      <p className="text-zinc-600 dark:text-zinc-400">
        {formatCurrency(slice.value)} · {slice.share.toFixed(1)}%
      </p>
    </div>
  );
};

export const SectorAllocation = ({
  sectors,
  totalInvestment,
}: SectorAllocationProps) => {
  const slices: Slice[] = sectors.map((sector) => ({
    sector: sector.sector,
    value: sector.totalInvestment,
    share:
      totalInvestment > 0 ? (sector.totalInvestment / totalInvestment) * 100 : 0,
  }));

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-semibold">Allocation by sector</h2>

      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        Share of {formatCurrency(totalInvestment)} invested
      </p>

      <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<AllocationTooltip />} />

              <Pie
                data={slices}
                dataKey="value"
                nameKey="sector"
                innerRadius="58%"
                outerRadius="92%"
                paddingAngle={2}
                stroke="var(--chart-surface)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {slices.map((slice) => (
                  <Cell key={slice.sector} fill={sectorColor(slice.sector)} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Sectors
            </span>

            <span className="text-2xl font-semibold">{slices.length}</span>
          </div>
        </div>

        <ul className="w-full space-y-2">
          {slices.map((slice) => (
            <li key={slice.sector} className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: sectorColor(slice.sector) }}
              />

              <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                {slice.sector}
              </span>

              <span className="w-14 text-right tabular-nums text-zinc-500 dark:text-zinc-400">
                {slice.share.toFixed(1)}%
              </span>

              <span className="w-28 text-right tabular-nums">
                {formatCurrency(slice.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
