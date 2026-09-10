import type { Portfolio } from "@/types/portfolio";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const fetchPortfolio = async (
  signal?: AbortSignal,
): Promise<Portfolio> => {
  const response = await fetch(`${API_URL}/api/portfolio`, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as Portfolio;
};
