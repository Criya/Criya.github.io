/**
 * Standard colors for Asian markets: Red = Up, Green = Down
 */
export const getTrendClass = (value: number, type: 'text' | 'bg' = 'text'): string => {
  if (value > 0) return type === 'text' ? 'text-red-500' : 'bg-red-500 text-white';
  if (value < 0) return type === 'text' ? 'text-emerald-500' : 'bg-emerald-500 text-white';
  return type === 'text' ? 'text-gray-400' : 'bg-gray-100 text-gray-500';
};

export const formatCurrency = (val: number, currency: '$' | '¥', digits = 2) => {
  return `${currency}${val.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};

export const formatPercent = (val: number) => {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
};

export const checkMarketOpen = (): { cn: boolean; us: boolean } => {
  const now = new Date();
  const day = now.getDay();
  const isWeekend = (day === 0 || day === 6);

  // A-Share Logic (Simple approximation)
  // UTC+8 9:15 - 15:05
  // Note: This runs on client time, assuming client is in/near CN or logic adjusted to UTC could be better, 
  // but keeping simple based on original requirements.
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeVal = hour * 100 + minute;
  let isCNOpen = !isWeekend && (timeVal >= 915 && timeVal <= 1505);
  // Lunch break 11:30 - 13:00 (approx)
  if (timeVal > 1135 && timeVal < 1255) isCNOpen = false;

  // US Market Logic
  // NY Time is approx UTC-4 or UTC-5. 
  // Simplified: Check standard market hours converted to local time or use strict UTC.
  // Using the original logic: NY Time Mon-Fri 04:00 - 20:00 (Extended hours included)
  const nyTimeStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const nyDate = new Date(nyTimeStr);
  const nyDay = nyDate.getDay();
  const nyHour = nyDate.getHours();
  const isUSOpen = (nyDay !== 0 && nyDay !== 6) && (nyHour >= 4 && nyHour < 20);

  return { cn: isCNOpen, us: isUSOpen };
};