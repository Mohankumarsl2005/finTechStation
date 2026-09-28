import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  AlignJustify, 
  BarChart2, 
  Activity, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ScannerItem } from '../../types/market';
import { AssetIcon } from '../common/AssetIcon';

interface InteractiveChartProps {
  selectedSymbol: string;
  instruments: ScannerItem[];
  onSelectSymbol: (symbol: string) => void;
  onOpenTradingPlan?: (symbol: string) => void;
}

interface Candle {
  date: string;
  month: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  selectedSymbol,
  instruments,
  onSelectSymbol
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
  const currentPrice = currentInstrument?.lastPrice || 62428.31;
  const change24h = currentInstrument?.change24h || 2428.17;
  const changePct = currentInstrument?.changePercent24h || 4.04;

  // Calculate dynamic technical levels based on current asset price
  const supportPrice = useMemo(() => {
    if (isBtc) return 58200;
    return Number((currentPrice * 0.932).toFixed(2));
  }, [isBtc, currentPrice]);

  const resistancePrice = useMemo(() => {
    if (isBtc) return 64800;
    return Number((currentPrice * 1.038).toFixed(2));
  }, [isBtc, currentPrice]);

  // Generate the authentic candlestick pattern matching the reference image
  const candles: Candle[] = useMemo(() => {
    const data: Candle[] = [];
    const count = 38;
    const baseP = currentPrice;

    // Pattern trajectory:
    // Starts ~49k (Jul) -> rises to ~58k -> consolidates/dips to ~54k (Aug) -> dips to ~52k -> strong rally to ~62.4k (Sep)
    const curveMultipliers = [
      0.80, 0.82, 0.81, 0.83, 0.80, 0.82, 0.85, 0.87, 0.86, 0.89, 0.88, 0.91,
      0.90, 0.93, 0.95, 0.94, 0.92, 0.90, 0.88, 0.89, 0.86, 0.87, 0.89, 0.88,
      0.86, 0.87, 0.89, 0.90, 0.89, 0.91, 0.92, 0.94, 0.96, 0.95, 0.97, 0.98,
      0.99, 1.00
    ];

    const months = ['Jul', 'Aug', 'Sep'];

    for (let i = 0; i < count; i++) {
      const monthIdx = Math.floor((i / count) * 3);
      const targetClose = baseP * curveMultipliers[i];
      const prevClose = i > 0 ? data[i - 1].close : targetClose * 0.99;
      
      const open = prevClose;
      const isUp = targetClose >= open;
      const spread = Math.abs(targetClose - open);
      const wickHigh = targetClose + spread * (0.3 + Math.random() * 0.5);
      const wickLow = Math.min(open, targetClose) - spread * (0.3 + Math.random() * 0.5);
      const volume = Math.floor(25 + Math.random() * 55 + (i > 30 ? 30 : 0));

      data.push({
        date: `2026-0${7 + monthIdx}-${10 + (i % 20)}`,
        month: months[monthIdx],
        open,
        close: targetClose,
        high: Math.max(open, targetClose, wickHigh),
        low: Math.min(open, targetClose, wickLow),
        volume
      });
    }

    // Pin the final candle precisely to current live price
    if (data.length > 0) {
      const last = data[data.length - 1];
      last.close = currentPrice;
      last.high = Math.max(last.high, currentPrice * 1.006);
    }

    return data;
  }, [currentPrice]);

  // Chart dimensions & scaling
  const chartWidth = 840;
  const chartHeight = 310;
  const margin = { top: 20, right: 65, bottom: 45, left: 10 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const minVal = useMemo(() => {
    const rawMin = Math.min(...candles.map((c) => c.low));
    return rawMin * 0.97;
  }, [candles]);

  const maxVal = useMemo(() => {
    const rawMax = Math.max(...candles.map((c) => c.high));
    return rawMax * 1.03;
  }, [candles]);

  const valueRange = maxVal - minVal || 1;

  const getY = (val: number) => {
    return margin.top + innerHeight - ((val - minVal) / valueRange) * innerHeight;
  };

  const candleW = innerWidth / candles.length;

  // Y-axis tick values (e.g. 48,000, 52,000, 56,000, 60,000, 64,000, 68,000)
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = valueRange / 5;
    for (let i = 0; i <= 5; i++) {
      ticks.push(minVal + step * i);
    }
    return ticks;
  }, [minVal, valueRange]);

  const activeCandle = hoveredIndex !== null ? candles[hoveredIndex] : candles[candles.length - 1];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 font-sans select-none pb-12">
      {/* 1. TOP PIPELINE BREADCRUMB BAR */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 py-2 text-[11px] sm:text-xs font-semibold tracking-wider text-slate-700 uppercase">
        <span className="hover:text-slate-950 transition-colors">PRICE</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="hover:text-slate-950 transition-colors">TREND</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="hover:text-slate-950 transition-colors">SUPPORT</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="hover:text-slate-950 transition-colors">RESISTANCE</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="hover:text-slate-950 transition-colors">MOMENTUM</span>
      </div>

      {/* 2. MAIN CARD: ASSET HEADER + CANDLESTICK CHART */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        {/* Header: Asset + Price & Timeframe controls */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4">
          {/* Asset Title & Live Price */}
          <div className="flex items-start gap-3">
            <AssetIcon symbol={currentInstrument?.symbol || 'BTC'} size={44} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {currentInstrument?.name || 'Bitcoin'}
                </h1>
                {/* Asset quick dropdown switcher */}
                <select
                  value={currentInstrument?.symbol || 'BTC'}
                  onChange={(e) => onSelectSymbol(e.target.value)}
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
                {currentInstrument?.symbol || 'BTC'} / USDT
              </span>

              {/* Price & Change */}
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-semibold text-emerald-500">
                  +{change24h >= 0 ? change24h.toLocaleString(undefined, { minimumFractionDigits: 2 }) : Math.abs(change24h).toFixed(2)} (+{changePct.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex items-center gap-1 bg-transparent p-1">
            {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => {
              const isActive = timeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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

        {/* Candlestick & Volume Chart Canvas */}
        <div className="relative w-full overflow-hidden mt-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-[320px] select-none cursor-crosshair overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Grid horizontal guidelines */}
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
                  {/* Right Y-Axis labels */}
                  <text
                    x={margin.left + innerWidth + 12}
                    y={y + 3.5}
                    fill="#94A3B8"
                    fontSize="11"
                    fontFamily="system-ui, sans-serif"
                    fontWeight="500"
                  >
                    {tickVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </text>
                </g>
              );
            })}

            {/* Support and Resistance dashed reference zones */}
            <line
              x1={margin.left}
              y1={getY(resistancePrice)}
              x2={margin.left + innerWidth}
              y2={getY(resistancePrice)}
              stroke="#F43F5E"
              strokeDasharray="4 4"
              strokeWidth="1"
              opacity="0.4"
            />
            <line
              x1={margin.left}
              y1={getY(supportPrice)}
              x2={margin.left + innerWidth}
              y2={getY(supportPrice)}
              stroke="#10B981"
              strokeDasharray="4 4"
              strokeWidth="1"
              opacity="0.4"
            />

            {/* Candlesticks & Volume Bars */}
            {candles.map((c, idx) => {
              const isBull = c.close >= c.open;
              const xCenter = margin.left + idx * candleW + candleW / 2;
              const candleBoxW = Math.max(3.5, candleW * 0.65);

              const yOpen = getY(c.open);
              const yClose = getY(c.close);
              const yHigh = getY(c.high);
              const yLow = getY(c.low);

              const boxTop = Math.min(yOpen, yClose);
              const boxHeight = Math.max(2, Math.abs(yOpen - yClose));

              // Colors matching image: vibrant green (#10B981) and clean crimson (#EF4444)
              const color = isBull ? '#10B981' : '#EF4444';
              const volColor = isBull ? '#A7F3D0' : '#FECDD3';

              const isHovered = hoveredIndex === idx;

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  className="cursor-pointer"
                >
                  {/* High - Low Wick */}
                  <line
                    x1={xCenter}
                    y1={yHigh}
                    x2={xCenter}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.2"
                  />

                  {/* Open - Close Rectangular Body */}
                  <rect
                    x={xCenter - candleBoxW / 2}
                    y={boxTop}
                    width={candleBoxW}
                    height={boxHeight}
                    fill={color}
                    rx="0.5"
                  />

                  {/* Volume Histogram Bar at the bottom */}
                  <rect
                    x={xCenter - candleBoxW / 2}
                    y={margin.top + innerHeight - (c.volume / 100) * 28}
                    width={candleBoxW}
                    height={(c.volume / 100) * 28}
                    fill={volColor}
                    rx="0.5"
                  />

                  {/* Hover highlight column */}
                  {isHovered && (
                    <line
                      x1={xCenter}
                      y1={margin.top}
                      x2={xCenter}
                      y2={margin.top + innerHeight}
                      stroke="#94A3B8"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                  )}
                </g>
              );
            })}

            {/* Green Price Callout Pill on right axis */}
            <g transform={`translate(${margin.left + innerWidth + 4}, ${getY(currentPrice) - 10})`}>
              <rect
                x="0"
                y="0"
                width="72"
                height="20"
                rx="4"
                fill="#10B981"
              />
              <text
                x="36"
                y="13.5"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="10"
                fontFamily="system-ui, sans-serif"
                fontWeight="700"
              >
                ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </text>
            </g>

            {/* Bottom X-Axis Months (Jul, Aug, Sep) */}
            <text
              x={margin.left + innerWidth * 0.16}
              y={chartHeight - 12}
              textAnchor="middle"
              fill="#64748B"
              fontSize="12"
              fontWeight="500"
            >
              Jul
            </text>
            <text
              x={margin.left + innerWidth * 0.50}
              y={chartHeight - 12}
              textAnchor="middle"
              fill="#64748B"
              fontSize="12"
              fontWeight="500"
            >
              Aug
            </text>
            <text
              x={margin.left + innerWidth * 0.83}
              y={chartHeight - 12}
              textAnchor="middle"
              fill="#64748B"
              fontSize="12"
              fontWeight="500"
            >
              Sep
            </text>
          </svg>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: 5 ANALYSIS CARDS (TREND, SUPPORT, RESISTANCE, VOLUME, MOMENTUM) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Trend */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-emerald-500 mb-2">
              <TrendingUp className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-slate-900 block mb-0.5">
              Trend
            </span>
            <div className="text-sm font-bold text-slate-950 mb-1.5">
              Higher Highs
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Uptrend remains intact with strong momentum.
            </p>
          </div>
          <div className="mt-4">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
              BULLISH
            </span>
          </div>
        </div>

        {/* Card 2: Support */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-blue-500 mb-2">
              <AlignJustify className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-slate-900 block mb-0.5">
              Support
            </span>
            <div className="text-sm font-bold text-slate-950 mb-1.5">
              ${supportPrice.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Key support zone holding on higher timeframes.
            </p>
          </div>
          <div className="mt-4">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
              STRONG
            </span>
          </div>
        </div>

        {/* Card 3: Resistance */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-rose-500 mb-2">
              <AlignJustify className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-slate-900 block mb-0.5">
              Resistance
            </span>
            <div className="text-sm font-bold text-slate-950 mb-1.5">
              ${resistancePrice.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Next major resistance level to watch.
            </p>
          </div>
          <div className="mt-4">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600">
              KEY LEVEL
            </span>
          </div>
        </div>

        {/* Card 4: Volume */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-blue-500 mb-2">
              <BarChart2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-slate-900 block mb-0.5">
              Volume
            </span>
            <div className="text-sm font-bold text-emerald-500 mb-1.5">
              +42%
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Above average volume confirms strength.
            </p>
          </div>
          <div className="mt-4">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
              CONFIRMED
            </span>
          </div>
        </div>

        {/* Card 5: Momentum */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-purple-500 mb-2">
              <Activity className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-slate-900 block mb-0.5">
              Momentum
            </span>
            <div className="text-sm font-bold text-slate-950 mb-1.5">
              Strong
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              RSI and MACD show bullish momentum.
            </p>
          </div>
          <div className="mt-4">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
              BULLISH
            </span>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: AI TECHNICAL ANALYSIS (ASTRA STYLE) */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            {/* Swirl AI Logo icon matching the photo */}
            <div className="h-8 w-8 rounded-full bg-slate-950 flex items-center justify-center text-white shrink-0">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M20.5 11.5a4.5 4.5 0 0 0-4-4.47V6a6 6 0 0 0-11.2-2.9A4.5 4.5 0 0 0 2 7.5a4.5 4.5 0 0 0 .5 2A4.5 4.5 0 0 0 2 13a4.5 4.5 0 0 0 3.3 4.35A6 6 0 0 0 16.5 20a4.5 4.5 0 0 0 4-4.5 4.5 4.5 0 0 0 0-4z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-950 tracking-tight">
                Astra Technical Analysis
              </h3>
              <span className="text-[11px] text-slate-400 font-medium block">
                Generated with ChatGPT Astra
              </span>
            </div>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Today, 10:24 AM
          </span>
        </div>

        {/* Narrative Box (Light Blue Bubble) */}
        <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-[#F0F6FE] text-slate-700 text-sm leading-relaxed font-normal">
          {currentInstrument?.symbol || 'BTC'} is in a clear uptrend with higher highs and higher lows. 
          Price is holding above key support at ${supportPrice.toLocaleString()} with strong volume and bullish momentum. 
          The next major resistance to watch is ${resistancePrice.toLocaleString()}. Overall structure remains bullish as long as ${supportPrice.toLocaleString()} holds.
        </div>

        {/* Bottom Tag Badges matching photo */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
            UPTREND
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
            STRONG VOLUME
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
            KEY RESISTANCE: ${resistancePrice.toLocaleString()}
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
            KEY SUPPORT: ${supportPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
