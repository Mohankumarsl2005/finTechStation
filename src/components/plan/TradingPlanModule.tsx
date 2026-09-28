import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Target, 
  ShieldAlert, 
  Check, 
  FileText, 
  CheckCircle2,
  BookmarkPlus,
  Volume2
} from 'lucide-react';
import { ScannerItem } from '../../types/market';
import { AssetIcon } from '../common/AssetIcon';

interface TradingPlanModuleProps {
  initialSymbol?: string;
  instruments: ScannerItem[];
  onSaveToJournal: (tradeData: any) => void;
}

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const TradingPlanModule: React.FC<TradingPlanModuleProps> = ({
  initialSymbol = 'BTC/USD',
  instruments,
  onSaveToJournal
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Active instrument or default BTC
  const currentInst = useMemo(() => {
    const s = selectedSymbol.toUpperCase().replace('/', '');
    return (
      instruments.find(
        (i) => i.symbol.toUpperCase().replace('/', '') === s || i.symbol === selectedSymbol
      ) ||
      instruments.find((i) => i.symbol.includes('BTC')) ||
      instruments[0]
    );
  }, [selectedSymbol, instruments]);

  const isBtc = currentInst?.symbol.includes('BTC');
  const currentPrice = currentInst?.lastPrice || 62428.31;
  const changePct = currentInst?.changePercent24h || 2.14;
  const changeAmt = isBtc ? 1308 : Number((currentPrice * (changePct / 100)).toFixed(2));

  // Dynamic levels matching the photo or proportioned to selected asset
  const entryLow = useMemo(() => isBtc ? 62000 : Number((currentPrice * 0.993).toFixed(2)), [isBtc, currentPrice]);
  const entryHigh = useMemo(() => isBtc ? 62600 : Number((currentPrice * 1.003).toFixed(2)), [isBtc, currentPrice]);
  const target1 = useMemo(() => isBtc ? 68500 : Number((currentPrice * 1.098).toFixed(2)), [isBtc, currentPrice]);
  const target2 = useMemo(() => isBtc ? 74000 : Number((currentPrice * 1.186).toFixed(2)), [isBtc, currentPrice]);
  const invalidation = useMemo(() => isBtc ? 58200 : Number((currentPrice * 0.932).toFixed(2)), [isBtc, currentPrice]);

  const target1Pct = Number((((target1 - currentPrice) / currentPrice) * 100).toFixed(1));
  const target2Pct = Number((((target2 - currentPrice) / currentPrice) * 100).toFixed(1));
  const invalidationPct = Number((((invalidation - currentPrice) / currentPrice) * 100).toFixed(1));

  // Generate realistic candles spanning Aug 1 -> Sep 15 matching the photo
  const candles: Candle[] = useMemo(() => {
    const data: Candle[] = [];
    const count = 36;
    const baseP = currentPrice;

    // Trajectory: 48k -> 56k (Aug 1 - 15) -> dips to ~58k (Sep 1) -> retests entry zone ~62.3k (Sep 15)
    const curve = [
      0.78, 0.81, 0.79, 0.82, 0.80, 0.84, 0.86, 0.85, 0.88, 0.89, 0.92, 0.95,
      0.97, 0.96, 0.94, 0.93, 0.90, 0.89, 0.91, 0.93, 0.95, 0.94, 0.92, 0.91,
      0.92, 0.93, 0.95, 0.96, 0.97, 0.98, 0.99, 1.00
    ];

    for (let i = 0; i < curve.length; i++) {
      const targetC = baseP * curve[i];
      const prevC = i > 0 ? data[i - 1].close : targetC * 0.99;
      const open = prevC;
      const spread = Math.abs(targetC - open);
      const high = Math.max(open, targetC) + spread * (0.3 + Math.random() * 0.4);
      const low = Math.min(open, targetC) - spread * (0.3 + Math.random() * 0.4);
      const volume = 30 + Math.random() * 50;

      data.push({ open, close: targetC, high, low, volume });
    }

    // Pin last candle precisely
    if (data.length > 0) {
      data[data.length - 1].close = currentPrice;
      data[data.length - 1].high = Math.max(data[data.length - 1].high, currentPrice * 1.005);
    }

    return data;
  }, [currentPrice]);

  // SVG Chart math
  const chartWidth = 560;
  const chartHeight = 310;
  const margin = { top: 25, right: 65, bottom: 35, left: 10 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Domain covers from 46,000 up to 78,000 matching the photo's Y-axis (48k - 76k)
  const minVal = useMemo(() => isBtc ? 46000 : currentPrice * 0.72, [isBtc, currentPrice]);
  const maxVal = useMemo(() => isBtc ? 78000 : currentPrice * 1.25, [isBtc, currentPrice]);
  const rangeVal = maxVal - minVal || 1;

  const getY = (val: number) => {
    return margin.top + innerHeight - ((val - minVal) / rangeVal) * innerHeight;
  };

  const candleW = innerWidth / candles.length;

  const yTicks = [48000, 52000, 56000, 60000, 64000, 68000, 72000, 76000];

  const handleCommitPlan = () => {
    onSaveToJournal({
      symbol: currentInst?.symbol || 'BTC/USD',
      assetClass: currentInst?.assetClass || 'CRYPTO',
      direction: 'LONG',
      entryPrice: (entryLow + entryHigh) / 2,
      stopLoss: invalidation,
      takeProfit: target1,
      quantity: 1,
      status: 'PENDING',
      strategyTag: 'Breakout Continuation',
      timeframe: '1D - 4H',
      notes: `Target 1: $${target1.toLocaleString()}, Target 2: $${target2.toLocaleString()}, Invalidation: $${invalidation.toLocaleString()}`,
      entryDate: new Date().toISOString().split('T')[0]
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 font-sans select-none pb-12">
      {/* 1. TOP PIPELINE BREADCRUMB BAR */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 text-[11px] sm:text-xs font-semibold tracking-wider text-slate-700 uppercase">
        <span className="hover:text-slate-950 transition-colors">CLEAR LEVELS</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="hover:text-slate-950 transition-colors">DEFINED RISKS</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="hover:text-slate-950 transition-colors">MULTIPLE SCENARIOS</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="hover:text-slate-950 transition-colors">READY TO EXECUTE</span>
      </div>

      {/* 2. MAIN SECTION: 2 COLUMNS (VISUAL PLAN CHART + ASTRA RESEARCH PLAN TABLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Visual Trade Plan Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            {/* Header: Asset + Price & Timeframe controls */}
            <div className="flex items-start justify-between gap-3 pb-3">
              <div className="flex items-start gap-3">
                <AssetIcon symbol={currentInst?.symbol || 'BTC'} size={42} />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {currentInst?.name || 'Bitcoin'}
                    </h2>
                    <select
                      value={currentInst?.symbol || 'BTC/USD'}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 focus:outline-none cursor-pointer"
                    >
                      {instruments.map((inst) => (
                        <option key={inst.symbol} value={inst.symbol}>
                          {inst.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wide block">
                    {currentInst?.symbol || 'BTC'} / USDT
                  </span>

                  {/* Price & Change */}
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-extrabold text-slate-950 tracking-tight">
                      ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm font-semibold text-emerald-500">
                      +{changePct.toFixed(2)}% (+${changeAmt.toLocaleString()})
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeframe Pills */}
              <div className="flex items-center gap-1">
                {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => {
                  const isActive = timeframe === tf;
                  return (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        isActive
                          ? 'bg-slate-950 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {tf}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candlestick Canvas with Trade Execution Zones */}
            <div className="relative w-full overflow-hidden mt-1">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-[310px] select-none overflow-visible"
              >
                {/* Horizontal price grid lines & Right Axis Labels */}
                {yTicks.map((tickVal, idx) => {
                  const y = getY(tickVal);
                  return (
                    <g key={idx}>
                      <line
                        x1={margin.left}
                        y1={y}
                        x2={margin.left + innerWidth}
                        y2={y}
                        stroke="#F1F5F9"
                        strokeDasharray="2 3"
                        strokeWidth="1"
                      />
                      <text
                        x={margin.left + innerWidth + 10}
                        y={y + 3.5}
                        fill="#94A3B8"
                        fontSize="10"
                        fontFamily="system-ui, sans-serif"
                        fontWeight="500"
                      >
                        {tickVal.toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* ZONE 1: Target 2 Shaded Band */}
                <rect
                  x={margin.left}
                  y={getY(target2) - 8}
                  width={innerWidth}
                  height={16}
                  fill="#10B981"
                  fillOpacity="0.08"
                />
                <line
                  x1={margin.left}
                  y1={getY(target2)}
                  x2={margin.left + innerWidth}
                  y2={getY(target2)}
                  stroke="#10B981"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left + innerWidth - 55}
                  y={getY(target2) - 3}
                  fill="#059669"
                  fontSize="11"
                  fontWeight="600"
                >
                  Target 2
                </text>
                {/* Green Target 2 Price Pill */}
                <g transform={`translate(${margin.left + innerWidth + 4}, ${getY(target2) - 10})`}>
                  <rect x="0" y="0" width="58" height="20" rx="4" fill="#10B981" />
                  <text x="29" y="13.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                    ${target2.toLocaleString()}
                  </text>
                </g>

                {/* ZONE 2: Target 1 Shaded Band */}
                <rect
                  x={margin.left}
                  y={getY(target1) - 8}
                  width={innerWidth}
                  height={16}
                  fill="#10B981"
                  fillOpacity="0.08"
                />
                <line
                  x1={margin.left}
                  y1={getY(target1)}
                  x2={margin.left + innerWidth}
                  y2={getY(target1)}
                  stroke="#10B981"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left + innerWidth - 55}
                  y={getY(target1) - 3}
                  fill="#059669"
                  fontSize="11"
                  fontWeight="600"
                >
                  Target 1
                </text>
                {/* Green Target 1 Price Pill */}
                <g transform={`translate(${margin.left + innerWidth + 4}, ${getY(target1) - 10})`}>
                  <rect x="0" y="0" width="58" height="20" rx="4" fill="#10B981" />
                  <text x="29" y="13.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                    ${target1.toLocaleString()}
                  </text>
                </g>

                {/* ZONE 3: Invalidation (Stop Loss) Red Shaded Band */}
                <rect
                  x={margin.left}
                  y={getY(invalidation) - 8}
                  width={innerWidth}
                  height={16}
                  fill="#EF4444"
                  fillOpacity="0.09"
                />
                <line
                  x1={margin.left}
                  y1={getY(invalidation)}
                  x2={margin.left + innerWidth}
                  y2={getY(invalidation)}
                  stroke="#EF4444"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left + innerWidth - 65}
                  y={getY(invalidation) - 3}
                  fill="#DC2626"
                  fontSize="11"
                  fontWeight="600"
                >
                  Invalidation
                </text>
                {/* Red Invalidation Price Pill */}
                <g transform={`translate(${margin.left + innerWidth + 4}, ${getY(invalidation) - 10})`}>
                  <rect x="0" y="0" width="58" height="20" rx="4" fill="#EF4444" />
                  <text x="29" y="13.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                    ${invalidation.toLocaleString()}
                  </text>
                </g>

                {/* ZONE 4: Entry Zone Blue Shaded Band */}
                <rect
                  x={margin.left}
                  y={getY(entryHigh)}
                  width={innerWidth}
                  height={Math.max(12, getY(entryLow) - getY(entryHigh))}
                  fill="#3B82F6"
                  fillOpacity="0.10"
                />
                <line
                  x1={margin.left}
                  y1={getY((entryLow + entryHigh) / 2)}
                  x2={margin.left + innerWidth}
                  y2={getY((entryLow + entryHigh) / 2)}
                  stroke="#3B82F6"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left + innerWidth - 65}
                  y={getY((entryLow + entryHigh) / 2) - 3}
                  fill="#2563EB"
                  fontSize="11"
                  fontWeight="600"
                >
                  Entry Zone
                </text>
                {/* Blue Entry Zone Price Pill */}
                <g transform={`translate(${margin.left + innerWidth + 4}, ${getY((entryLow + entryHigh) / 2) - 10})`}>
                  <rect x="0" y="0" width="58" height="20" rx="4" fill="#2563EB" />
                  <text x="29" y="13.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                    ${Math.round((entryLow + entryHigh) / 2).toLocaleString()}
                  </text>
                </g>

                {/* DASHED PROJECTION ARROW to Target 1 & 2 matching photo */}
                <path
                  d={`M ${margin.left + innerWidth * 0.65} ${getY((entryLow + entryHigh) / 2)} 
                      Q ${margin.left + innerWidth * 0.76} ${getY(target1) + 10} 
                      ${margin.left + innerWidth * 0.85} ${getY(target1) - 15}`}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                />
                <polygon
                  points={`${margin.left + innerWidth * 0.85},${getY(target1) - 18} ${margin.left + innerWidth * 0.835},${getY(target1) - 10} ${margin.left + innerWidth * 0.865},${getY(target1) - 10}`}
                  fill="#0D9488"
                />

                {/* Candlesticks & Volume */}
                {candles.map((c, idx) => {
                  const isBull = c.close >= c.open;
                  const xCenter = margin.left + idx * candleW + candleW / 2;
                  const boxW = Math.max(3.5, candleW * 0.65);

                  const yOpen = getY(c.open);
                  const yClose = getY(c.close);
                  const yHigh = getY(c.high);
                  const yLow = getY(c.low);

                  const boxTop = Math.min(yOpen, yClose);
                  const boxHeight = Math.max(2, Math.abs(yOpen - yClose));

                  const color = isBull ? '#10B981' : '#EF4444';
                  const volColor = isBull ? '#A7F3D0' : '#FECDD3';

                  return (
                    <g key={idx}>
                      <line x1={xCenter} y1={yHigh} x2={xCenter} y2={yLow} stroke={color} strokeWidth="1.2" />
                      <rect x={xCenter - boxW / 2} y={boxTop} width={boxW} height={boxHeight} fill={color} rx="0.5" />
                      {/* Volume bar at bottom */}
                      <rect
                        x={xCenter - boxW / 2}
                        y={margin.top + innerHeight - (c.volume / 100) * 22}
                        width={boxW}
                        height={(c.volume / 100) * 22}
                        fill={volColor}
                        rx="0.5"
                      />
                    </g>
                  );
                })}

                {/* Bottom X-Axis Timestamps (Aug 1, Aug 15, Sep 1, Sep 15) */}
                <text x={margin.left + innerWidth * 0.12} y={chartHeight - 8} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="500">
                  Aug 1
                </text>
                <text x={margin.left + innerWidth * 0.38} y={chartHeight - 8} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="500">
                  Aug 15
                </text>
                <text x={margin.left + innerWidth * 0.64} y={chartHeight - 8} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="500">
                  Sep 1
                </text>
                <text x={margin.left + innerWidth * 0.88} y={chartHeight - 8} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="500">
                  Sep 15
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Astra Research Plan - Trade Setup Details (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
                  Astra Research Plan
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
                  Trade Setup Details
                </span>
              </div>
            </div>

            {/* Key-Value Details Table matching photo */}
            <div className="divide-y divide-slate-100 text-xs mt-1">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Asset</span>
                <span className="font-semibold text-slate-900">{currentInst?.symbol || 'BTC'} / USDT</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Setup</span>
                <span className="font-semibold text-slate-900">Breakout Continuation</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Trend</span>
                <span className="font-semibold text-slate-900">Uptrend</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Entry Zone</span>
                <span className="font-semibold text-slate-900">${entryLow.toLocaleString()} – ${entryHigh.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Invalidation</span>
                <span className="font-semibold text-rose-600">${invalidation.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Target 1</span>
                <span className="font-semibold text-slate-900">${target1.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Target 2</span>
                <span className="font-semibold text-slate-900">${target2.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Risk / Reward</span>
                <span className="font-bold text-slate-950">2.8 : 1</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Timeframe</span>
                <span className="font-semibold text-slate-900">1D – 4H</span>
              </div>

              {/* Key Risks Bullets */}
              <div className="py-2.5">
                <span className="text-slate-500 font-medium block mb-1.5">Key Risks</span>
                <ul className="space-y-1 text-slate-700 text-xs pl-1">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>FOMC this week</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>High volatility</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>Possible fake breakout</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>Watch exchange flows</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: 4 TRADE PARAMETER CARDS (ENTRY ZONE, TARGET 1, TARGET 2, INVALIDATION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Entry Zone */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-blue-500 mb-2">
              <Target className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block mb-1">
              ENTRY ZONE
            </span>
            <div className="text-base font-extrabold text-slate-950 mb-1">
              ${entryLow.toLocaleString()} – ${entryHigh.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 leading-snug">
              Optimal area to enter based on structure.
            </p>
          </div>
        </div>

        {/* Card 2: Target 1 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-emerald-500 mb-2">
              <Target className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block mb-1">
              TARGET 1
            </span>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-base font-extrabold text-slate-950">
                ${target1.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-500">
                +{target1Pct}%
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-snug underline cursor-pointer hover:text-slate-800">
              First take profit level.
            </p>
          </div>
        </div>

        {/* Card 3: Target 2 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-emerald-500 mb-2">
              <Target className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block mb-1">
              TARGET 2
            </span>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-base font-extrabold text-slate-950">
                ${target2.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-500">
                +{target2Pct}%
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-snug">
              Secondary target if momentum continues.
            </p>
          </div>
        </div>

        {/* Card 4: Invalidation */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-rose-500 mb-2">
              <ShieldAlert className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block mb-1">
              INVALIDATION
            </span>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-base font-extrabold text-slate-950">
                ${invalidation.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-rose-500">
                {invalidationPct}%
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-snug">
              If price breaks below this level, the setup is invalid.
            </p>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ACTION CARD: READY FOR HUMAN REVIEW */}
      <div className="rounded-2xl border-2 border-emerald-500/25 bg-[#ECFDF5]/50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
            <Check className="h-5 w-5 stroke-[3]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight">
              Ready for Human Review
            </h4>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
              Plan complete. Review, adjust if needed, then execute.
            </p>
          </div>
        </div>

        {/* Right Quote & Commit action button */}
        <div className="flex items-center gap-4 text-right">
          <div className="hidden md:block">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block leading-tight">
              Discipline Turns
            </span>
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block leading-tight">
              Plans Into Profit
            </span>
          </div>

          <button
            onClick={handleCommitPlan}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold tracking-wide transition-all shadow-md active:scale-95"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Committed to Journal!</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4 text-emerald-400" />
                <span>Commit Plan to Journal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
