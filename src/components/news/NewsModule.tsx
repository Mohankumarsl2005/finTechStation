import React, { useState } from 'react';
import { Newspaper, Calendar, Globe, ExternalLink, Flame, TrendingUp, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import { NewsItem } from '../../types/market';

interface NewsModuleProps {
  news: NewsItem[];
}

export const NewsModule: React.FC<NewsModuleProps> = ({ news }) => {
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'FOREX_FACTORY' | 'WORLD_MONITOR'>('ALL');

  const filteredNews = news.filter((item) => {
    if (sourceFilter === 'ALL') return true;
    return item.source === sourceFilter;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0C1222] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Global Financial News &amp; Macro Calendar
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live economic calendar events from Forex Factory and geopolitical intelligence from WorldMonitor.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center p-1 rounded-lg border border-slate-800 bg-slate-900 font-mono text-xs">
            <button
              onClick={() => setSourceFilter('ALL')}
              className={`px-3 py-1 rounded transition-colors ${
                sourceFilter === 'ALL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Feeds
            </button>
            <button
              onClick={() => setSourceFilter('FOREX_FACTORY')}
              className={`px-3 py-1 rounded transition-colors ${
                sourceFilter === 'FOREX_FACTORY' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Forex Factory Calendar
            </button>
            <button
              onClick={() => setSourceFilter('WORLD_MONITOR')}
              className={`px-3 py-1 rounded transition-colors ${
                sourceFilter === 'WORLD_MONITOR' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WorldMonitor Geopolitics
            </button>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-3">
        {filteredNews.map((item) => {
          const isForexFactory = item.source === 'FOREX_FACTORY';
          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-[#0C1222] p-4 font-mono hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {item.source === 'FOREX_FACTORY' ? 'FOREX FACTORY' : 'WORLD MONITOR'}
                  </span>

                  {item.impact && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.impact === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {item.impact} IMPACT
                    </span>
                  )}

                  {item.currency && (
                    <span className="text-[11px] font-bold text-white">
                      [{item.currency}]
                    </span>
                  )}

                  <span className="text-[11px] text-slate-500">· {item.publishedAt}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`font-semibold ${
                      item.sentiment === 'BULLISH'
                        ? 'text-emerald-400'
                        : item.sentiment === 'BEARISH'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.sentiment}
                  </span>
                </div>
              </div>

              {/* Title & Summary */}
              <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.summary}
              </p>

              {/* Calendar Data (if applicable) */}
              {isForexFactory && item.actual && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-6 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">ACTUAL</span>
                    <span className="font-bold text-emerald-400">{item.actual}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">FORECAST</span>
                    <span className="text-slate-300">{item.forecast}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">PREVIOUS</span>
                    <span className="text-slate-400">{item.previous}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
