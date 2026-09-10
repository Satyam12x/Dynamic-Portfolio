"use client";

import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";
import type { PortfolioSector } from "@/types/portfolio";

type SectorPerformanceProps = {
  sectors: PortfolioSector[];
};

type Row = {
  sector: string;
  gainLoss: number;
  pricedInvestment: number;
};

const compactAxis = (value: number): string => {
  const abs = Math.abs(value);

  if (abs >= 10_000_000) {
    return `${(value / 10_000_000).toFixed(1)}Cr`;
  }

  if (abs >= 100_000) {
    return `${(value / 100_000).toFixed(1)}L`;
  }

  if (abs >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }

  return String(Math.round(value));
};

const PerformanceTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: Row }[];
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;

  if (!row) {
    return null;
  }

  const percent =
    row.pricedInvestment > 0 ? (row.gainLoss / row.pricedInvestment) * 100 : 0;

  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <p className="font-medium">{row.sector}</p>

      <p
        style={{
          color: row.gainLoss >= 0 ? "var(--chart-gain)" : "var(--chart-loss)",
        }}
      >
        {formatCurrency(row.gainLoss)} · {percent.toFixed(1)}%
      </p>
    </div>
  );
};

export const SectorPerformance = ({ sectors }: SectorPerformanceProps) => {
  const rows: Row[] = sectors.map((sector) => ({
    sector: sector.sector,
    gainLoss: sector.totalGainLoss,
    pricedInvestment: sector.pricedInvestment,
  }));

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-semibold">Gain and loss by sector</h2>

      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        Bars right of the line are gains, left are losses
      </p>

      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={rows}
            margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
            barCategoryGap="22%"
          >
            <XAxis
              type="number"
              tickFormatter={compactAxis}
              tick={{ fontSize: 11, fill: "var(--chart-muted)" }}
              axisLine={{ stroke: "var(--chart-axis)" }}
              tickLine={false}
            />

            <YAxis
              type="category"
              dataKey="sector"
              width={80}
              tick={{ fontSize: 12, fill: "var(--chart-muted)" }}
              axisLine={false}
              tickLine={false}
            />

            <ReferenceLine x={0} stroke="var(--chart-axis)" />

            <Tooltip cursor={false} content={<PerformanceTooltip />} />

            <Bar dataKey="gainLoss" radius={2} isAnimationActive={false}>
              {rows.map((row) => (
                <Cell
                  key={row.sector}
                  fill={
                    row.gainLoss >= 0
                      ? "var(--chart-gain)"
                      : "var(--chart-loss)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
