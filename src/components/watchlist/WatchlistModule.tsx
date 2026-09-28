import React from 'react';
import { Star, TrendingUp, TrendingDown, LineChart, Compass, Trash2 } from 'lucide-react';
import { ScannerItem } from '../../types/market';

interface WatchlistModuleProps {
  watchlistItems: ScannerItem[];
  onToggleWatchlist: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
  onOpenTradingPlan: (symbol: string) => void;
}

export const WatchlistModule: React.FC<WatchlistModuleProps> = ({
  watchlistItems,
  onToggleWatchlist,
  onOpenChart,
  onOpenTradingPlan
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0C1222] p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Curated Watchlist &amp; Priority Queue
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pinned instruments undergoing active liquidity &amp; breakout monitoring.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400">
            {watchlistItems.length} Pinned Assets
          </span>
        </div>

        {watchlistItems.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-mono text-xs">
            <Star className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 font-semibold">Your watchlist is currently empty</p>
            <p className="text-slate-500 mt-1">Click the star icon next to any instrument in the Scanner or Dashboard to pin it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pt-4">
            {watchlistItems.map((item) => {
              const isPositive = item.changePercent24h >= 0;
              return (
                <div
                  key={item.symbol}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 font-mono hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.symbol}</span>
                        <span className="text-[10px] text-slate-500">{item.assetClass}</span>
                      </div>
                      <button
                        onClick={() => onToggleWatchlist(item.symbol)}
                        className="text-amber-400 hover:text-rose-400 transition-colors p-1"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.name}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-slate-500 text-[10px] block">PRICE</span>
                        <span className="font-bold text-slate-100 text-sm">
                          ${item.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block">24H RETURN</span>
                        <span
                          className={`font-semibold text-xs flex items-center justify-end gap-0.5 ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {isPositive ? '+' : ''}{item.changePercent24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & London Edge Tag */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">LSE SCORE:</span>
                      <span className="font-bold text-cyan-400">{item.londonEdgeScore}/100</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenChart(item.symbol)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-400"
                        title="Chart"
                      >
                        <LineChart className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenTradingPlan(item.symbol)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-emerald-400"
                        title="Plan"
                      >
                        <Compass className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
