export type Exchange = "NSE" | "BSE";

export type PortfolioHolding = {
  name: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercent: number;
  exchange: Exchange;
  exchangeCode: string;
  yahooSymbol: string | null;
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  earningsDate: string | null;
  sector: string;
};

export type PortfolioSector = {
  sector: string;
  totalInvestment: number;
  pricedInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalHoldings: number;
  pricedHoldings: number;
  holdings: PortfolioHolding[];
};

export type Portfolio = {
  totalInvestment: number;
  pricedInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalHoldings: number;
  pricedHoldings: number;
  isComplete: boolean;
  sectors: PortfolioSector[];
};
