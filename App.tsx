import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import SummaryCard from './components/SummaryCard';
import SettingsModal from './components/SettingsModal';
import { INITIAL_PORTFOLIO, CASH_POOL_CNY, DEFAULT_EXCHANGE_RATE, REFRESH_INTERVAL_MS, DEFAULT_FINNHUB_KEY } from './constants';
import { StockData, PortfolioSummary, MarketStatus } from './types';
import { fetchCNStocks, fetchUSStocks, fetchExchangeRate } from './services/marketDataService';
import { formatCurrency, formatPercent, getTrendClass, checkMarketOpen } from './utils';
import { TrendingUp, Globe, DollarSign, Activity } from 'lucide-react';

const App: React.FC = () => {
  // State
  // Use localStorage key if exists, otherwise use the default key
  const [finnhubKey, setFinnhubKey] = useState<string>(() => localStorage.getItem('finnhubKey') || DEFAULT_FINNHUB_KEY);
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE);
  const [stocks, setStocks] = useState<StockData[]>(() => 
    INITIAL_PORTFOLIO.map(p => ({ 
      ...p, 
      currentPrice: p.cost, 
      marketValue: p.cost * p.shares, 
      pl: 0, 
      plPercent: 0 
    }))
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Market Status (Derived from time)
  const [marketStatus, setMarketStatus] = useState<MarketStatus>({ cn: false, us: false });

  // Update market status frequently (every minute)
  useEffect(() => {
    const updateStatus = () => setMarketStatus(checkMarketOpen());
    updateStatus();
    const timer = setInterval(updateStatus, 60000);
    return () => clearInterval(timer);
  }, []);

  // Main Data Fetch Logic
  const fetchData = useCallback(async (force = false) => {
    setIsRefreshing(true);
    const { cn, us } = checkMarketOpen();
    const shouldFetchCN = force || cn;
    const shouldFetchUS = force || us;

    try {
      const [cnPrices, usPrices, rate] = await Promise.all([
        shouldFetchCN ? fetchCNStocks(INITIAL_PORTFOLIO) : Promise.resolve(new Map<string, number>()),
        shouldFetchUS ? fetchUSStocks(INITIAL_PORTFOLIO, finnhubKey) : Promise.resolve(new Map<string, number>()),
        (force || cn || us) ? fetchExchangeRate() : Promise.resolve(null)
      ]);

      if (rate) setExchangeRate(rate);

      setStocks(prevStocks => {
        return prevStocks.map(stock => {
          let newPrice = stock.currentPrice;
          
          if (stock.market === 'cn' && cnPrices.has(stock.code)) {
            newPrice = cnPrices.get(stock.code)!;
          } else if (stock.market === 'us' && usPrices.has(stock.code)) {
            newPrice = usPrices.get(stock.code)!;
          }

          const marketValue = newPrice * stock.shares;
          const costValue = stock.cost * stock.shares;
          const pl = marketValue - costValue;
          const plPercent = costValue !== 0 ? (pl / costValue) * 100 : 0;

          return { ...stock, currentPrice: newPrice, marketValue, pl, plPercent };
        });
      });
      setLastUpdated(new Date());

    } catch (error) {
      console.error("Refresh failed", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [finnhubKey]);

  // Initial load and interval
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Derived Summary Calculations
  const summary: PortfolioSummary = useMemo(() => {
    let usValUSD = 0, usCostUSD = 0;
    let cnValCNY = 0, cnCostCNY = 0;

    stocks.forEach(s => {
      if (s.market === 'us') {
        usValUSD += s.marketValue;
        usCostUSD += (s.cost * s.shares);
      } else {
        cnValCNY += s.marketValue;
        cnCostCNY += (s.cost * s.shares);
      }
    });

    const usValCNY = usValUSD * exchangeRate;
    const usCostCNY = usCostUSD * exchangeRate;

    const totalAssetCNY = CASH_POOL_CNY + cnValCNY + usValCNY;
    const totalCostCNY = CASH_POOL_CNY + cnCostCNY + usCostCNY;
    const totalPL = totalAssetCNY - totalCostCNY;
    const totalPLPercent = totalCostCNY > 0 ? (totalPL / totalCostCNY) * 100 : 0;

    const usPLUSD = usValUSD - usCostUSD;
    const usPLPercent = usCostUSD > 0 ? (usPLUSD / usCostUSD) * 100 : 0;

    const cnPLCNY = cnValCNY - cnCostCNY;
    const cnPLPercent = cnCostCNY > 0 ? (cnPLCNY / cnCostCNY) * 100 : 0;

    return {
      totalAssetCNY, totalPL, totalPLPercent,
      usMarketValueUSD: usValUSD, usCostUSD, usPLUSD, usPLPercent,
      cnMarketValueCNY: cnValCNY, cnCostCNY, cnPLCNY, cnPLPercent,
      exchangeRate
    };
  }, [stocks, exchangeRate]);

  return (
    <div className="min-h-screen pb-12 font-sans text-gray-700 bg-gray-50/50">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
        marketStatus={marketStatus}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <SummaryCard 
            title="总资产净值 (CNY)"
            isPrimary
            mainValue={formatCurrency(summary.totalAssetCNY, '¥')}
            subValue={formatCurrency(summary.totalAssetCNY - summary.totalPL, '¥')}
            plValue={summary.totalPL}
            plText={`${summary.totalPL >= 0 ? '+' : ''}${formatCurrency(summary.totalPL, '¥')} (${formatPercent(summary.totalPLPercent)})`}
            icon={<Globe className="w-4 h-4" />}
            extraInfo={
              <div className="flex w-full justify-between items-center opacity-80">
                <span>汇率: 1 USD = {summary.exchangeRate.toFixed(4)}</span>
                <span>现金: ¥{CASH_POOL_CNY.toLocaleString()}</span>
              </div>
            }
          />

          <SummaryCard 
            title="美股持仓 (USD)"
            mainValue={formatCurrency(summary.usMarketValueUSD, '$')}
            subValue={formatCurrency(summary.usCostUSD, '$')}
            plValue={summary.usPLUSD}
            plText={`${summary.usPLUSD >= 0 ? '+' : ''}${formatCurrency(summary.usPLUSD, '$')} (${formatPercent(summary.usPLPercent)})`}
            icon={<DollarSign className="w-4 h-4" />}
          />

          <SummaryCard 
            title="A股持仓 (CNY)"
            mainValue={formatCurrency(summary.cnMarketValueCNY, '¥')}
            subValue={formatCurrency(summary.cnCostCNY, '¥')}
            plValue={summary.cnPLCNY}
            plText={`${summary.cnPLCNY >= 0 ? '+' : ''}${formatCurrency(summary.cnPLCNY, '¥')} (${formatPercent(summary.cnPLPercent)})`}
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-row justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              持仓明细
            </h3>
            <div className="text-xs text-gray-400 font-mono">
              {lastUpdated.toLocaleTimeString('zh-CN', { hour12: false })}
            </div>
          </div>
          
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">标的</th>
                  <th className="px-6 py-4 text-right font-medium">持仓</th>
                  <th className="px-6 py-4 text-right font-medium">成本</th>
                  <th className="px-6 py-4 text-right font-medium">现价</th>
                  <th className="px-6 py-4 text-right font-medium">市值</th>
                  <th className="px-6 py-4 text-right font-medium">盈亏</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stocks.map((stock) => {
                  const currency = stock.market === 'us' ? '$' : '¥';
                  const trendColor = getTrendClass(stock.pl, 'text');
                  const sign = stock.pl > 0 ? '+' : '';
                  
                  return (
                    <tr key={stock.code} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{stock.name}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{stock.code}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-gray-600">{stock.shares}</td>
                      <td className="px-6 py-4 text-right font-mono text-gray-500">{stock.cost.toFixed(3)}</td>
                      <td className={`px-6 py-4 text-right font-mono font-bold ${trendColor}`}>
                        {stock.currentPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                        {currency}{stock.marketValue.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono ${trendColor}`}>
                        <div className="font-bold">{sign}{stock.pl.toFixed(2)}</div>
                        <div className="text-xs opacity-70">({sign}{stock.plPercent.toFixed(2)}%)</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentKey={finnhubKey}
        onSave={(key) => {
          setFinnhubKey(key);
          localStorage.setItem('finnhubKey', key);
          // Trigger a refresh after saving key
          setTimeout(() => fetchData(true), 100);
        }}
      />
    </div>
  );
};

export default App;