import { formatCurrency, formatPercent, gainLossColor } from "@/lib/format";
import type { Portfolio } from "@/types/portfolio";

type PortfolioSummaryProps = {
  portfolio: Portfolio;
};

type StatProps = {
  label: string;
  value: string;
  className?: string;
  hint?: string;
};

const Stat = ({ label, value, className, hint }: StatProps) => (
  <div className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
      {label}
    </p>

    <p className={`mt-1 text-xl font-semibold ${className ?? ""}`}>{value}</p>

    {hint ? (
      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
    ) : null}
  </div>
);

export const PortfolioSummary = ({ portfolio }: PortfolioSummaryProps) => {
  const returnPercent =
    portfolio.totalGainLoss !== null && portfolio.pricedInvestment > 0
      ? (portfolio.totalGainLoss / portfolio.pricedInvestment) * 100
      : null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Total Investment"
        value={formatCurrency(portfolio.totalInvestment)}
        hint={`${portfolio.totalHoldings} holdings`}
      />

      <Stat
        label="Present Value"
        value={formatCurrency(portfolio.totalPresentValue)}
        hint={
          portfolio.isComplete
            ? undefined
            : `Based on ${portfolio.pricedHoldings} priced holdings`
        }
      />

      <Stat
        label="Gain / Loss"
        value={formatCurrency(portfolio.totalGainLoss)}
        className={gainLossColor(portfolio.totalGainLoss)}
      />

      <Stat
        label="Return"
        value={formatPercent(returnPercent)}
        className={gainLossColor(portfolio.totalGainLoss)}
      />
    </div>
  );
};
