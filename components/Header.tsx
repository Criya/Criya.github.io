import React, { useEffect, useState } from 'react';
import { Settings, RefreshCw, Activity, Moon } from 'lucide-react';
import { MarketStatus } from '../types';

interface HeaderProps {
  onOpenSettings: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  marketStatus: MarketStatus;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, onRefresh, isRefreshing, marketStatus }) => {
  const [timeStr, setTimeStr] = useState<string>('--:--:--');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const StatusDot = ({ active, label }: { active: boolean; label: string }) => (
    <div className="flex items-center gap-1.5" title={`${label}市场状态`}>
      <span className={`relative flex h-2.5 w-2.5`}>
        {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${active ? 'bg-red-500' : 'bg-gray-300'}`}></span>
      </span>
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 border-b border-gray-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20 text-lg">
              L
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-none tracking-tight">
                LIANG 的实盘
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <StatusDot active={marketStatus.cn} label="A股" />
                <StatusDot active={marketStatus.us} label="美股" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block font-mono text-sm text-gray-400 font-medium tabular-nums bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
              {timeStr}
            </div>
            
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="API 设置"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium shadow-md shadow-gray-900/10 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">刷新</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;