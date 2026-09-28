import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ScannerItem } from '../../types/market';

interface LiveTickerTapeProps {
  items: ScannerItem[];
  onSelectSymbol: (symbol: string) => void;
}

export const LiveTickerTape: React.FC<LiveTickerTapeProps> = ({ items, onSelectSymbol }) => {
  if (!items || items.length === 0) return null;

  // Duplicate list to achieve continuous seamless loop
  const displayItems = [...items, ...items];

  return (
    <div className="w-full bg-[#080C17] border-b border-slate-800 overflow-hidden py-1.5 px-2 select-none">
      <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
        {displayItems.map((item, idx) => {
          const isPositive = item.changePercent24h >= 0;
          return (
            <button
              key={`${item.symbol}-${idx}`}
              onClick={() => onSelectSymbol(item.symbol)}
              className="inline-flex items-center gap-2 text-xs font-mono px-2 py-0.5 rounded hover:bg-slate-800/60 transition-colors"
            >
              <span className="font-bold text-slate-200">{item.symbol}</span>
              <span className="text-slate-300">
                {item.assetClass === 'FOREX' ? item.lastPrice.toFixed(4) : item.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 font-medium ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}{item.changePercent24h.toFixed(2)}%
              </span>
              {item.londonEdgeSignal === 'STRONG_BUY' && (
                <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  LSE:BUY
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
