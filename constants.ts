import { PortfolioItem } from './types';

export const CASH_POOL_CNY = 3000.00;
export const DEFAULT_EXCHANGE_RATE = 7.25;
export const REFRESH_INTERVAL_MS = 10000; // 10 seconds
export const DEFAULT_FINNHUB_KEY = 'd4jul8pr01qgcb0vme30d4jul8pr01qgcb0vme3g';

export const INITIAL_PORTFOLIO: PortfolioItem[] = [
  // 美股
  { market: 'us', code: 'QQQM', name: '纳指100', shares: 1, cost: 241.580 },
  { market: 'us', code: 'SPYM', name: '标普500', shares: 1, cost: 78.670 },
  { market: 'us', code: 'GLDM', name: '黄金', shares: 1, cost: 81.840 },
  { market: 'us', code: 'SCHD', name: '红利ETF', shares: 3, cost: 27.110 },
  
  // A股
  { market: 'cn', code: 'sh601328', name: '交通银行', shares: 100, cost: 7.670 },
  { market: 'cn', code: 'sh601988', name: '中国银行', shares: 100, cost: 6.210 },
  { market: 'cn', code: 'sh601728', name: '中国电信', shares: 100, cost: 6.860 }
];