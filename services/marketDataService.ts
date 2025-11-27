import { PortfolioItem, StockData } from '../types';

// Declare window extension for Tencent global variables
declare global {
  interface Window {
    [key: string]: any;
  }
}

/**
 * Fetch A-Share data using Tencent's JS Interface
 * We use a dynamic script tag to bypass CORS issues inherent with this specific API source.
 */
export const fetchCNStocks = (items: PortfolioItem[]): Promise<Map<string, number>> => {
  return new Promise((resolve) => {
    const cnItems = items.filter(i => i.market === 'cn');
    if (cnItems.length === 0) {
      resolve(new Map());
      return;
    }

    const codes = cnItems.map(p => p.code).join(',');
    const script = document.createElement('script');
    script.src = `https://qt.gtimg.cn/q=${codes}`;
    script.id = 'tencent_script';

    script.onload = () => {
      const priceMap = new Map<string, number>();
      cnItems.forEach(p => {
        try {
          const varName = `v_${p.code}`;
          if (window[varName]) {
            // Data format: v_sh600000="1:name:2:opening_price:3:closing_price:4:current_price..."
            const parts = window[varName].split('~');
            const current = parseFloat(parts[3]);
            if (!isNaN(current) && current > 0) {
              priceMap.set(p.code, current);
            }
          }
        } catch (e) {
          console.warn(`Error parsing CN stock ${p.code}`, e);
        }
      });
      document.body.removeChild(script); // Cleanup
      resolve(priceMap);
    };

    script.onerror = () => {
      console.error("Failed to load Tencent stock data");
      resolve(new Map());
    };

    document.body.appendChild(script);
  });
};

/**
 * Fetch US Stock data using Finnhub API
 */
export const fetchUSStocks = async (items: PortfolioItem[], apiKey: string): Promise<Map<string, number>> => {
  if (!apiKey) return new Map();

  const usItems = items.filter(i => i.market === 'us');
  const priceMap = new Map<string, number>();

  // Fetch in parallel
  const promises = usItems.map(async (item) => {
    try {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${item.code}&token=${apiKey}`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (data.c) {
        priceMap.set(item.code, data.c);
      }
    } catch (e) {
      console.warn(`Failed to fetch US stock ${item.code}`, e);
    }
  });

  await Promise.all(promises);
  return priceMap;
};

/**
 * Fetch USD/CNY Exchange Rate
 */
export const fetchExchangeRate = async (): Promise<number | null> => {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=CNY');
    const data = await res.json();
    return data.rates.CNY || null;
  } catch (e) {
    console.error("Failed to fetch exchange rate", e);
    return null;
  }
};