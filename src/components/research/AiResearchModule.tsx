import React, { useState, useMemo } from 'react';
import { 
  BarChart2, 
  FileText, 
  Globe, 
  Link2, 
  Check, 
  ArrowRight,
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  LineChart,
  CheckCircle2,
  RefreshCw,
  Copy
} from 'lucide-react';
import { ScannerItem } from '../../types/market';
import { AssetIcon } from '../common/AssetIcon';

interface AiResearchModuleProps {
  instruments: ScannerItem[];
  defaultSymbol?: string;
  onSelectSymbol: (symbol: string) => void;
}

export const AiResearchModule: React.FC<AiResearchModuleProps> = ({
  instruments,
  defaultSymbol = 'BTC',
  onSelectSymbol
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [isCopied, setIsCopied] = useState(false);

  // Find currently selected instrument or default to BTC
  const currentInstrument = useMemo(() => {
    const s = selectedSymbol.toUpperCase().replace('/', '');
    return (
      instruments.find(
        (i) => i.symbol.toUpperCase().replace('/', '') === s || i.symbol === selectedSymbol
      ) ||
      instruments.find((i) => i.symbol.includes('BTC')) ||
      instruments[0]
    );
  }, [selectedSymbol, instruments]);

  const isBtc = currentInstrument?.symbol.includes('BTC');
  const price = currentInstrument?.lastPrice || 62428.31;
  const changePct = currentInstrument?.changePercent24h || 2.14;

  const handleCopy = () => {
    const text = `Astra Research Brief - ${currentInstrument?.symbol || 'BTC'}\nPrice: $${price.toLocaleString()}\nKey Insights:\n- Strong uptrend with increasing volume.\n- Positive ETF inflows and institutional demand.\n- On-chain data shows reduced exchange supply.\n- Next key resistance at $64,800.\n- Overall outlook remains bullish, with manageable risk if support at $58,200 holds.`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 font-sans select-none pb-12">
      {/* 1. TOP PIPELINE BREADCRUMB BAR */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 py-2 text-[11px] sm:text-xs font-semibold tracking-wider text-slate-700 uppercase">
        <span className="hover:text-slate-950 transition-colors">MULTIPLE DATA SOURCES</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="hover:text-slate-950 transition-colors">DEEPER ANALYSIS</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="hover:text-slate-950 transition-colors">HIGHER CONFIDENCE</span>
      </div>

      {/* 2. FOUR MULTI-DATA SOURCE CARDS (ROW OF 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: MARKET DATA */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart2 className="h-4 w-4 stroke-[2.5]" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                MARKET DATA
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-snug">
              Real-time prices, and market structure.
            </p>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Price</span>
                <span className="font-bold text-slate-900">
                  ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">24h Change</span>
                <span className="font-bold text-emerald-500 flex items-center gap-0.5">
                  +{changePct.toFixed(2)}% ▲
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Volume</span>
                <span className="font-bold text-slate-900">$28.4B</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Market Cap</span>
                <span className="font-bold text-slate-900">$1.23T</span>
              </div>
            </div>
          </div>

          {/* Sparkline curve */}
          <div className="mt-4 pt-2">
            <svg viewBox="0 0 120 28" className="w-full h-7 overflow-visible">
              <path
                d="M 0,22 Q 15,10 30,18 T 60,12 T 90,6 T 120,4"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: VERIFIED NEWS */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="h-4 w-4 stroke-[2.5]" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                VERIFIED NEWS
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-snug">
              Latest news and market catalysts.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-1 shrink-0" />
                <div>
                  <p className="text-slate-800 font-medium leading-snug">
                    Fed signals rate cuts could come sooner
                  </p>
                  <span className="text-[10px] text-slate-400">2h ago</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                <div>
                  <p className="text-slate-800 font-medium leading-snug">
                    Bitcoin ETF inflows reach $300M
                  </p>
                  <span className="text-[10px] text-slate-400">5h ago</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1 shrink-0" />
                <div>
                  <p className="text-slate-800 font-medium leading-snug">
                    Major exchange adds SOL staking
                  </p>
                  <span className="text-[10px] text-slate-400">8h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: CRYPTO CONTEXT */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Globe className="h-4 w-4 stroke-[2.5]" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                CRYPTO CONTEXT
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-snug">
              Broader market conditions.
            </p>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Market Cap</span>
                <span className="font-bold text-slate-900">
                  $2.17T <span className="text-emerald-500 text-[11px] font-semibold">+2.8%</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Bitcoin Dominance</span>
                <span className="font-bold text-slate-900">
                  56.4% <span className="text-emerald-500 text-[11px] font-semibold">+0.6%</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Fear &amp; Greed Index</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">68</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                    Greed
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Altcoin Season</span>
                <span className="font-bold text-slate-900">No</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: ON-CHAIN DATA */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Link2 className="h-4 w-4 stroke-[2.5]" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                ON-CHAIN DATA
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-snug">
              When available, blockchain insights.
            </p>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Exchange Inflows</span>
                <span className="font-bold text-emerald-500">-12.4% ▲</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Whale Activity</span>
                <span className="font-bold text-emerald-500">High</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Active Addresses</span>
                <span className="font-bold text-emerald-500">+8.1% ▲</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Network Growth</span>
                <span className="font-bold text-emerald-500">+5.3% ▲</span>
              </div>
            </div>
          </div>

          {/* Histogram bars at bottom */}
          <div className="mt-4 pt-2 flex items-end gap-1 h-7">
            {[35, 45, 25, 55, 70, 40, 80, 60, 95, 50, 85, 90, 75, 100].map((h, idx) => (
              <div
                key={idx}
                style={{ height: `${h}%` }}
                className="flex-1 bg-cyan-100 rounded-t-xs"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. CONVERGENCE FLOW LINES & CENTRAL AI PROCESSING HUB */}
      <div className="relative py-2">
        {/* Subtle connecting curved lines SVG */}
        <div className="hidden lg:block w-full h-8 relative">
          <svg className="w-full h-full overflow-visible">
            {/* 4 connecting curved lines converging into center */}
            <path d="M 120,0 C 120,25 350,25 380,32" fill="none" stroke="#93C5FD" strokeWidth="1.5" />
            <path d="M 360,0 C 360,20 400,20 410,32" fill="none" stroke="#93C5FD" strokeWidth="1.5" />
            <path d="M 600,0 C 600,20 540,20 520,32" fill="none" stroke="#93C5FD" strokeWidth="1.5" />
            <path d="M 820,0 C 820,25 580,25 550,32" fill="none" stroke="#93C5FD" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Central Blue Processing Card */}
        <div className="max-w-md mx-auto rounded-2xl bg-[#0062FF] text-white p-4 sm:p-5 shadow-lg shadow-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Swirl AI Logo */}
            <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M20.5 11.5a4.5 4.5 0 0 0-4-4.47V6a6 6 0 0 0-11.2-2.9A4.5 4.5 0 0 0 2 7.5a4.5 4.5 0 0 0 .5 2A4.5 4.5 0 0 0 2 13a4.5 4.5 0 0 0 3.3 4.35A6 6 0 0 0 16.5 20a4.5 4.5 0 0 0 4-4.5 4.5 4.5 0 0 0 0-4z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-tight">
                ChatGPT Astra
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">
                CRYPTO RESEARCH ENGINE
              </span>
            </div>
          </div>

          {/* Process step list */}
          <div className="text-right text-[10px] font-bold tracking-wider text-blue-100/90 leading-tight space-y-0.5 uppercase">
            <div>ANALYZE</div>
            <div>CONNECT</div>
            <div>REASON</div>
            <div>SUMMARIZE</div>
          </div>
        </div>

        {/* Downward connecting line into research brief */}
        <div className="w-full flex justify-center py-1">
          <div className="w-0.5 h-6 bg-blue-300 relative">
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-blue-400" />
          </div>
        </div>
      </div>

      {/* 4. FULL RESEARCH BRIEF CARD */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950 tracking-tight">
                FULL RESEARCH BRIEF
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                COMPREHENSIVE ANALYSIS GENERATED BY CHATGPT ASTRA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">
              Today, 10:24 AM
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{isCopied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* 3-Column Brief Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 pb-5">
          {/* Left Column: Asset Identity & Price */}
          <div className="md:col-span-3 flex flex-col justify-start">
            <div className="flex items-center gap-3 mb-3">
              <AssetIcon symbol={currentInstrument?.symbol || 'BTC'} size={46} />
              <div>
                <h4 className="text-lg font-bold text-slate-950 leading-tight">
                  {currentInstrument?.symbol || 'BTC'}
                </h4>
                <span className="text-xs text-slate-400 font-medium">
                  {currentInstrument?.name || 'Bitcoin'}
                </span>
              </div>
            </div>

            <div className="mt-1">
              <div className="text-2xl font-extrabold text-slate-950 tracking-tight">
                ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm font-semibold text-emerald-500 mt-0.5">
                +{changePct.toFixed(2)}%
              </div>
            </div>

            {/* Quick asset switcher */}
            <div className="mt-4">
              <select
                value={currentInstrument?.symbol || 'BTC'}
                onChange={(e) => {
                  setSelectedSymbol(e.target.value);
                  onSelectSymbol(e.target.value);
                }}
                className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none"
              >
                {instruments.map((i) => (
                  <option key={i.symbol} value={i.symbol}>
                    Switch to {i.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Middle Column: KEY INSIGHTS */}
          <div className="md:col-span-6 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              KEY INSIGHTS
            </h5>

            <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>Strong uptrend with increasing volume.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>Positive ETF inflows and institutional demand.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>On-chain data shows reduced exchange supply.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>Next key resistance at $64,800.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>
                  Overall outlook remains bullish, with manageable risk if support at $58,200 holds.
                </span>
              </li>
            </ul>
          </div>

          {/* Right Column: CONFIDENCE Gauge */}
          <div className="md:col-span-3 flex flex-col items-center justify-center text-center">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              CONFIDENCE
            </h5>

            {/* Circular Ring Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center mb-3">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - 0.78)}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute text-xl font-extrabold text-slate-900">
                78%
              </div>
            </div>

            <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
              HIGH CONFIDENCE
            </span>
          </div>
        </div>

        {/* Bottom Feature Badges matching photo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="text-blue-600">
              <FileText className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                DETAILED ANALYSIS
              </span>
              <span className="text-[10px] text-slate-400">Full report included</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="text-blue-600">
              <LineChart className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                CHART ANNOTATIONS
              </span>
              <span className="text-[10px] text-slate-400">Key levels marked</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="text-rose-500">
              <AlertTriangle className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                RISKS IDENTIFIED
              </span>
              <span className="text-[10px] text-slate-400">Downside scenarios</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="text-blue-600">
              <Lightbulb className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                TRADE IDEAS
              </span>
              <span className="text-[10px] text-slate-400">Multiple scenarios</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
