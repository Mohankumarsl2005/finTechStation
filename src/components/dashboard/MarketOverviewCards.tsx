import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, Activity } from 'lucide-react';
import { ScannerItem } from '../../types/market';

interface MarketOverviewCardsProps {
  keyIndices: ScannerItem[];
  keyForex: ScannerItem[];
  keyCrypto: ScannerItem[];
  onSelectInstrument: (item: ScannerItem) => void;
}

export const MarketOverviewCards: React.FC<MarketOverviewCardsProps> = ({
  keyIndices,
  keyForex,
  keyCrypto,
  onSelectInstrument
}) => {
  // Sparkline generator helper
  const renderSparkline = (points?: number[], isPositive: boolean = true) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const coordinates = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');

    const strokeColor = isPositive ? '#10b981' : '#f43f5e';

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coordinates}
        />
      </svg>
    );
  };

  const sections = [
    { title: 'Global Benchmarks', items: keyIndices, subtitle: 'Equities & Volatility' },
    { title: 'FX Major Rates', items: keyForex, subtitle: 'G10 Currency Pairs' },
    { title: 'Digital Assets', items: keyCrypto, subtitle: 'Spot Market Liquidity' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sections.map((sec) => (
        <div
          key={sec.title}
          className="rounded-xl border border-slate-800 bg-[#0C1222]/90 p-4 shadow-sm"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                {sec.title}
              </h3>
              <p className="text-[11px] font-mono text-slate-450">{sec.subtitle}</p>
            </div>
            <Activity className="h-3.5 w-3.5 text-slate-500" />
          </div>

          {/* Cards List */}
          <div className="space-y-2.5">
            {sec.items.map((item) => {
              const isPositive = item.changePercent24h >= 0;
              const formattedPrice = item.assetClass === 'FOREX' 
                ? item.lastPrice.toFixed(4)
                : item.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

              return (
                <div
                  key={item.symbol}
                  onClick={() => onSelectInstrument(item)}
                  className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-850/70 border border-transparent hover:border-slate-750 transition-all cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {item.symbol}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[90px]">
                        {item.name}
                      </span>
                    </div>
                    {/* Range preview */}
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-500">
                      <span>L: {item.low24h.toFixed(2)}</span>
                      <span>·</span>
                      <span>H: {item.high24h.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Sparkline mini chart */}
                  <div className="hidden sm:block shrink-0 px-2">
                    {renderSparkline(item.sparkline, isPositive)}
                  </div>

                  {/* Price & Change */}
                  <div className="text-right font-mono">
                    <div className="text-xs font-semibold text-slate-100 tabular-nums">
                      ${formattedPrice}
                    </div>
                    <div
                      className={`text-[11px] font-medium flex items-center justify-end gap-0.5 tabular-nums ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}{item.changePercent24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
