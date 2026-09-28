import React from 'react';
import { Gauge, Flame, Percent, DollarSign, Compass, Zap } from 'lucide-react';

interface QuickMacroBarProps {
  onSelectBenchmark?: (sym: string) => void;
}

export const QuickMacroBar: React.FC<QuickMacroBarProps> = ({ onSelectBenchmark }) => {
  const macros = [
    {
      label: 'CBOE VIX',
      value: '15.42',
      change: '-0.68 (-4.22%)',
      isBullish: true,
      desc: 'Low Volatility Environment'
    },
    {
      label: 'US 10Y YIELD',
      value: '3.784%',
      change: '+0.018 (+0.48%)',
      isBullish: false,
      desc: 'Treasury Benchmark'
    },
    {
      label: 'DXY DOLLAR',
      value: '100.84',
      change: '-0.16 (-0.16%)',
      isBullish: true,
      desc: 'USD Currency Index'
    },
    {
      label: 'FEAR & GREED',
      value: '68 / 100',
      change: 'Greed',
      isBullish: true,
      desc: 'Market Sentiment'
    },
    {
      label: 'LONDON EDGE BIAS',
      value: '84.2',
      change: 'NET BULLISH',
      isBullish: true,
      desc: 'Institutional Flow Delta'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {macros.map((m) => (
        <div
          key={m.label}
          className="rounded-lg border border-slate-800 bg-[#0B101E] p-3 text-xs font-mono"
        >
          <div className="flex items-center justify-between text-slate-450 mb-1">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              {m.label}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
          </div>

          <div className="text-sm lg:text-base font-bold text-white tabular-nums tracking-tight">
            {m.value}
          </div>

          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className={m.isBullish ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
              {m.change}
            </span>
            <span className="text-[10px] text-slate-500 hidden xl:inline">
              {m.desc}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
