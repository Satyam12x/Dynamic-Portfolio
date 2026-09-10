const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

export const EMPTY = "-";

export const formatCurrency = (value: number | null | undefined): string => {
  return typeof value === "number" ? currency.format(value) : EMPTY;
};

export const formatNumber = (value: number | null | undefined): string => {
  return typeof value === "number" ? decimal.format(value) : EMPTY;
};

export const formatPercent = (value: number | null | undefined): string => {
  return typeof value === "number" ? `${decimal.format(value)}%` : EMPTY;
};

export const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return EMPTY;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return EMPTY;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const gainLossColor = (value: number | null | undefined): string => {
  if (typeof value !== "number") {
    return "text-zinc-500 dark:text-zinc-400";
  }

  if (value > 0) {
    return "text-green-600 dark:text-green-400";
  }

  if (value < 0) {
    return "text-red-600 dark:text-red-400";
  }

  return "text-zinc-600 dark:text-zinc-300";
};
