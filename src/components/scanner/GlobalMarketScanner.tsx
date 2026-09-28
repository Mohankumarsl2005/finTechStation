import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  MoveRight, 
  ShieldCheck, 
  BarChart2, 
  Coins, 
  ArrowUpRight, 
  ArrowRight,
  ChevronDown,
  RefreshCw,
  Search,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  Sun,
  Moon
} from 'lucide-react';
import { ScannerItem, AssetClass } from '../../types/market';
import { AssetIcon } from '../common/AssetIcon';
import { api } from '../../services/api';

interface GlobalMarketScannerProps {
  onSelectInstrument: (item: ScannerItem) => void;
  onOpenChart: (symbol: string) => void;
  onOpenTradingPlan: (symbol: string) => void;
  onOpenAlertModal: (item: ScannerItem) => void;
  onToggleWatchlist: (symbol: string) => void;
  watchlistSymbols: Set<string>;
}

export const GlobalMarketScanner: React.FC<GlobalMarketScannerProps> = ({
  onSelectInstrument,
  onOpenChart,
  onOpenTradingPlan,
  onOpenAlertModal,
  onToggleWatchlist,
  watchlistSymbols
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRYPTO' | 'STOCKS' | 'CONFIDENT'>('ALL');
  const [items, setItems] = useState<ScannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light'); // default to light matching user photo
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial scanner items
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getScannerItems({
        assetClass: activeFilter === 'CRYPTO' ? 'CRYPTO' : activeFilter === 'STOCKS' ? 'STOCKS' : 'ALL',
        searchQuery: searchQuery,
        preset: activeFilter === 'CONFIDENT' ? 'LONDON_STRONG_BUY' : 'ALL',
        sortBy: 'volume24h',
        sortDirection: 'desc',
        page: 0,
        pageSize: 50
      });
      setItems(res.items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilter, searchQuery]);

  // Subtle real-time price tick effect
  useEffect(() => {
    const timer = setInterval(() => {
      setItems((prev) => {
        if (!prev || prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        const item = prev[idx];
        if (!item) return prev;

        const delta = (Math.random() * 0.002 - 0.0009);
        const newPrice = Number((item.lastPrice * (1 + delta)).toFixed(item.lastPrice < 1 ? 4 : 2));
        const updated = [...prev];
        updated[idx] = {
          ...item,
          lastPrice: newPrice
        };
        return updated;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Filtered display items
  const displayItems = items.filter((i) => {
    if (activeFilter === 'CRYPTO' && i.assetClass !== 'CRYPTO') return false;
    if (activeFilter === 'STOCKS' && i.assetClass !== 'STOCKS') return false;
    if (activeFilter === 'CONFIDENT' && i.londonEdgeScore < 85) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q);
    }
    return true;
  });

  // Top Setups for the bottom cards (matching BTC, ETH, SOL from photo)
  const topSetups = [
    items.find((i) => i.symbol === 'BTC') || items[0],
    items.find((i) => i.symbol === 'ETH') || items[1],
    items.find((i) => i.symbol === 'SOL') || items[2]
  ].filter(Boolean) as ScannerItem[];

  // Mini Sparkline SVG Renderer matching the smooth green wave in photo
  const renderMiniWave = (isPositive = true) => {
    return (
      <svg width="105" height="34" viewBox="0 0 105 34" fill="none" className="overflow-visible">
        <path
          d="M2 28 C 15 26, 25 32, 35 25 C 45 18, 55 24, 65 14 C 75 8, 85 18, 95 10 C 98 7, 102 4, 104 2"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 28 C 15 26, 25 32, 35 25 C 45 18, 55 24, 65 14 C 75 8, 85 18, 95 10 C 98 7, 102 4, 104 2 L 104 34 L 2 34 Z"
          fill="url(#sparkGrad)"
          opacity="0.15"
        />
        <defs>
          <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const isLight = themeMode === 'light';

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
      isLight ? 'text-slate-800' : 'text-slate-100'
    }`}>
      {/* Theme Switch & Search Tool */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className={`absolute left-3 top-2.5 h-3.5 w-3.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker, company, or coin..."
              className={`pl-9 pr-4 py-1.5 rounded-xl text-xs font-sans transition-all w-64 ${
                isLight 
                  ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500'
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isLight
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isLight ? <Moon className="h-3.5 w-3.5 text-blue-600" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
            <span>{isLight ? 'Dark Terminal' : 'Light Clean Mode'}</span>
          </button>
        </div>
      </div>

      {/* ---------------- 1. TOP METRICS CARDS (EXACT ROW OF 4) ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Coins / Stocks Scanned */}
        <div className={`rounded-2xl p-5 border transition-all ${
          isLight ? 'bg-white border-slate-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]' : 'bg-[#0E1526] border-slate-800 shadow-sm'
        }`}>
          <div className="text-xs font-medium text-slate-500 mb-1">
            Total Coins Scanned
          </div>
          <div className={`text-2xl lg:text-3xl font-bold tracking-tight mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            12,438
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-500">
              ▲ +18.7%
            </span>
            <div className={`p-1.5 rounded-lg ${isLight ? 'bg-cyan-50 text-cyan-500' : 'bg-cyan-950/60 text-cyan-400'}`}>
              <Coins className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Card 2: New Opportunities */}
        <div className={`rounded-2xl p-5 border transition-all ${
          isLight ? 'bg-white border-slate-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]' : 'bg-[#0E1526] border-slate-800 shadow-sm'
        }`}>
          <div className="text-xs font-medium text-slate-500 mb-1">
            New Opportunities
          </div>
          <div className={`text-2xl lg:text-3xl font-bold tracking-tight mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            48
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-500">
              ▲ +33.3%
            </span>
            <div className={`p-1.5 rounded-lg ${isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-950/60 text-blue-400'}`}>
              <BarChart2 className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Card 3: High Confidence */}
        <div className={`rounded-2xl p-5 border transition-all ${
          isLight ? 'bg-white border-slate-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]' : 'bg-[#0E1526] border-slate-800 shadow-sm'
        }`}>
          <div className="text-xs font-medium text-slate-500 mb-1">
            High Confidence
          </div>
          <div className={`text-2xl lg:text-3xl font-bold tracking-tight mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            11
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-500">
              ▲ +57.1%
            </span>
            <div className={`p-1.5 rounded-lg ${isLight ? 'bg-sky-50 text-sky-500' : 'bg-sky-950/60 text-sky-400'}`}>
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Card 4: Market Sentiment */}
        <div className={`rounded-2xl p-5 border transition-all ${
          isLight ? 'bg-white border-slate-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]' : 'bg-[#0E1526] border-slate-800 shadow-sm'
        }`}>
          <div className="text-xs font-medium text-slate-500 mb-1">
            Market Sentiment
          </div>
          <div className="text-2xl lg:text-3xl font-bold tracking-tight text-[#10B981] mb-3">
            Bullish
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Fear &amp; Greed: 68
            </span>
            <div className={`p-1.5 rounded-lg ${isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-950/60 text-blue-400'}`}>
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- 2. MARKET SCANNER MAIN CARD & TABLE ---------------- */}
      <div className={`rounded-2xl border transition-all overflow-hidden ${
        isLight ? 'bg-white border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)]' : 'bg-[#0E1526] border-slate-800 shadow-sm'
      }`}>
        {/* Card Header matching photo */}
        <div className="flex items-center justify-between p-5 pb-4">
          <div className="flex items-center gap-2.5">
            {/* Target Crosshair Icon in soft blue circle */}
            <div className={`p-1.5 rounded-full ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-950/60 text-blue-400'}`}>
              <Target className="h-5 w-5" />
            </div>
            <h3 className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Market Scanner
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Data Badge */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>Live Data</span>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className={`appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium cursor-pointer border transition-colors ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' 
                    : 'bg-slate-900 border-slate-750 text-slate-200 hover:bg-slate-850'
                }`}
              >
                <option value="ALL">All Coins &amp; Stocks</option>
                <option value="CRYPTO">All Coins</option>
                <option value="STOCKS">All Stocks</option>
                <option value="CONFIDENT">High Confidence Only</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 pointer-events-none text-slate-400" />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs font-medium border-t border-b ${
                isLight 
                  ? 'border-slate-100 text-slate-450 bg-slate-50/50' 
                  : 'border-slate-800 text-slate-400 bg-slate-900/50'
              }`}>
                <th className="py-3 px-5 w-12 text-slate-400 font-medium">#</th>
                <th className="py-3 px-4 font-medium">Asset</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">24h %</th>
                <th className="py-3 px-4 font-medium">Volume</th>
                <th className="py-3 px-4 font-medium text-center">Momentum</th>
                <th className="py-3 px-5 font-medium text-center">Status</th>
              </tr>
            </thead>

            <tbody className={`divide-y text-xs font-sans ${
              isLight ? 'divide-slate-100 text-slate-700' : 'divide-slate-800/80 text-slate-200'
            }`}>
              {displayItems.slice(0, 10).map((item, index) => {
                const isPositive = item.changePercent24h >= 0;
                const formattedPrice = item.assetClass === 'FOREX'
                  ? `$${item.lastPrice.toFixed(4)}`
                  : item.lastPrice >= 1
                  ? `$${item.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `$${item.lastPrice.toFixed(2)}`;

                const vol = item.volumeDisplay || `$${(item.volume24h / 1e9).toFixed(1)}B`;
                const isWatch = item.statusBadge === 'WATCH' || watchlistSymbols.has(item.symbol);

                return (
                  <tr
                    key={item.symbol}
                    className={`transition-colors ${
                      isLight ? 'hover:bg-slate-50/70' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3.5 px-5 text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    {/* Asset Logo & Symbol */}
                    <td className="py-3.5 px-4">
                      <div 
                        onClick={() => onSelectInstrument(item)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <AssetIcon symbol={item.symbol} size={28} />
                        <div>
                          <span className={`font-bold text-sm tracking-tight group-hover:text-blue-600 transition-colors ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}>
                            {item.symbol}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className={`py-3.5 px-4 font-semibold text-sm ${
                      isLight ? 'text-slate-800' : 'text-slate-100'
                    }`}>
                      {formattedPrice}
                    </td>

                    {/* 24h % in green */}
                    <td className="py-3.5 px-4 font-semibold text-emerald-500 text-sm">
                      {isPositive ? '+' : ''}{item.changePercent24h.toFixed(2)}%
                    </td>

                    {/* Volume */}
                    <td className={`py-3.5 px-4 font-medium ${
                      isLight ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      {vol}
                    </td>

                    {/* Momentum Arrow */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {item.momentum === 'FLAT' ? (
                          <MoveRight className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500 font-bold" />
                        )}
                      </div>
                    </td>

                    {/* Status Pill Button (ANALYZE / WATCH) */}
                    <td className="py-3.5 px-5 text-center">
                      {isWatch ? (
                        <button
                          onClick={() => onToggleWatchlist(item.symbol)}
                          className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
                            isLight
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              : 'bg-blue-950/60 text-blue-400 hover:bg-blue-900/60'
                          }`}
                        >
                          WATCH
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenChart(item.symbol)}
                          className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
                            isLight
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60'
                          }`}
                        >
                          ANALYZE
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- 3. TOP SETUPS FOUND SECTION ---------------- */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-full ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-950/60 text-blue-400'}`}>
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Top Setups Found
              </h3>
              <p className="text-xs text-slate-400">
                AI filtered from 12,438 coins
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveFilter('CONFIDENT')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 3 Setup Cards matching photo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topSetups.map((setup) => {
            const isPositive = setup.changePercent24h >= 0;
            return (
              <div
                key={setup.symbol}
                onClick={() => onSelectInstrument(setup)}
                className={`rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-md ${
                  isLight 
                    ? 'bg-white border-slate-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] hover:border-slate-200' 
                    : 'bg-[#0E1526] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header: Logo + Symbol + Setup Name */}
                <div className="flex items-center gap-3 mb-4">
                  <AssetIcon symbol={setup.symbol} size={36} />
                  <div>
                    <h4 className={`text-base font-bold tracking-tight leading-none ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {setup.symbol}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                      {setup.setupType || 'Breakout Setup'}
                    </span>
                  </div>
                </div>

                {/* Price, Return & Sparkline */}
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <div className={`text-xl font-bold tracking-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      ${setup.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs font-bold text-emerald-500 mt-0.5">
                      {isPositive ? '+' : ''}{setup.changePercent24h.toFixed(2)}%
                    </div>
                  </div>

                  {/* Smooth Green Wave Line */}
                  <div className="shrink-0 pl-2">
                    {renderMiniWave(isPositive)}
                  </div>
                </div>

                {/* HIGH CONFIDENCE Badge */}
                <div className="pt-2">
                  <span className={`inline-block w-full py-1.5 text-center text-[11px] font-bold tracking-wider rounded-lg uppercase ${
                    isLight 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40'
                  }`}>
                    HIGH CONFIDENCE
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
