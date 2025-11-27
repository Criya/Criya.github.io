import React from 'react';
import { getTrendClass } from '../utils';

interface SummaryCardProps {
  title: string;
  mainValue: string;
  subValue: string; // e.g. Cost
  plValue: number; // Raw profit/loss for color
  plText: string; // Formatted profit/loss text
  isPrimary?: boolean; // For the big total card
  extraInfo?: React.ReactNode;
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  mainValue, 
  subValue, 
  plValue, 
  plText, 
  isPrimary = false,
  extraInfo,
  icon
}) => {
  const trendClass = getTrendClass(plValue, isPrimary ? 'bg' : 'text');
  
  const content = (
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
           {icon && <span className={isPrimary ? "text-gray-400" : "text-gray-400"}>{icon}</span>}
           <h3 className={`text-xs font-bold uppercase tracking-wider ${isPrimary ? 'text-gray-400' : 'text-gray-500'}`}>
              {title}
           </h3>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${isPrimary ? trendClass : (plValue >= 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600')}`}>
          {plText}
        </span>
      </div>

      <div className="mt-4">
        <div className={`text-3xl sm:text-4xl font-bold tracking-tight ${isPrimary ? 'text-white' : 'text-gray-900'}`}>
          {mainValue}
        </div>
        <div className={`text-xs mt-2 font-medium flex items-center gap-1 ${isPrimary ? 'text-gray-400' : 'text-gray-500'}`}>
          <span>投入成本:</span>
          <span className="font-mono">{subValue}</span>
        </div>
      </div>
      
      {extraInfo && (
        <div className={`mt-4 pt-4 border-t text-xs flex justify-between ${isPrimary ? 'border-gray-800 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
          {extraInfo}
        </div>
      )}
    </div>
  );

  if (isPrimary) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gray-900 p-6 text-white shadow-xl shadow-gray-900/10 col-span-1 md:col-span-1 lg:col-span-1 ring-1 ring-white/10">
         <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
         <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
        {content}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/50 hover:shadow-md transition-shadow">
      {content}
    </div>
  );
};

export default SummaryCard;