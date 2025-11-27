export type MarketType = 'us' | 'cn';

export interface PortfolioItem {
  market: MarketType;
  code: string;
  name: string;
  shares: number;
  cost: number;
}

export interface StockData extends PortfolioItem {
  currentPrice: number;
  marketValue: number;
  pl: number; // Profit/Loss value
  plPercent: number; // Profit/Loss percentage
}

export interface MarketStatus {
  cn: boolean;
  us: boolean;
}

export interface PortfolioSummary {
  totalAssetCNY: number;
  totalPL: number;
  totalPLPercent: number;
  usMarketValueUSD: number;
  usCostUSD: number;
  usPLUSD: number;
  usPLPercent: number;
  cnMarketValueCNY: number;
  cnCostCNY: number;
  cnPLCNY: number;
  cnPLPercent: number;
  exchangeRate: number;
}