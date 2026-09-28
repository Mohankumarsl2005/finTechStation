import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  SlidersHorizontal, 
  Bell, 
  ShieldAlert, 
  Radio, 
  ExternalLink, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  KeyRound,
  CheckCircle2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { MarketOverviewData } from '../../types/market';

interface NavbarProps {
  overview: MarketOverviewData | null;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  overview,
  onOpenSearch,
  onOpenSettings,
  activeView,
  setActiveView
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString().slice(17, 25));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString().slice(17, 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isDemo = overview?.feedMode === 'DEMO_SIMULATION';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0A0F1D]/95 backdrop-blur-md">
      {/* Top micro ticker & market sessions */}
      <div className="flex h-9 items-center justify-between border-b border-slate-850 px-4 text-xs font-mono text-slate-450 bg-[#070B14]">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200">UTC {currentTime}</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Market Sessions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">LON</span>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${overview?.sessions?.london?.status === 'OPEN' ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              <span className={overview?.sessions?.london?.status === 'OPEN' ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                {overview?.sessions?.london?.status === 'OPEN' ? 'OPEN' : 'CLOSED'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">NYC</span>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${overview?.sessions?.newYork?.status === 'OPEN' ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              <span className={overview?.sessions?.newYork?.status === 'OPEN' ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                {overview?.sessions?.newYork?.status === 'OPEN' ? 'OPEN' : 'CLOSED'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">TYO</span>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${overview?.sessions?.tokyo?.status === 'OPEN' ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              <span className={overview?.sessions?.tokyo?.status === 'OPEN' ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                {overview?.sessions?.tokyo?.status === 'OPEN' ? 'OPEN' : 'CLOSED'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">SYD</span>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${overview?.sessions?.sydney?.status === 'OPEN' ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              <span className={overview?.sessions?.sydney?.status === 'OPEN' ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                {overview?.sessions?.sydney?.status === 'OPEN' ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>
        </div>

        {/* London Strategic Edge Status Badge */}
        <div className="flex items-center gap-3">
          {isDemo ? (
            <button
              onClick={onOpenSettings}
              className="group flex items-center gap-1.5 px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors"
              title="Click to configure London Strategic Edge live API credentials"
            >
              <ShieldAlert className="h-3 w-3 text-amber-400" />
              <span>FEED: DEMO SIMULATION</span>
              <span className="text-amber-500/70 group-hover:text-amber-300 underline text-[10px] ml-1">Configure Key</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>LONDON STRATEGIC EDGE: LIVE</span>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-500">KAFKA:</span>
            <span className="text-emerald-400">SYNCED</span>
          </div>
        </div>
      </div>

      {/* Main station navbar */}
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 font-bold text-slate-950 font-mono text-base">
              FT
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base lg:text-lg">
                  FinTech<span className="text-cyan-400">Station</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/90 font-semibold px-1 rounded bg-cyan-950/60 border border-cyan-800/40">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 leading-none">
                Institutional Multi-Asset Terminal
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-750 bg-slate-900/80 text-slate-400 text-xs hover:border-slate-600 hover:text-slate-200 transition-colors shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-450" />
              <span>Search stocks, ETFs, forex, crypto, indices...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right side metrics & action controls */}
        <div className="flex items-center gap-3">
          {/* Quick Portfolio P&L bar */}
          <div className="hidden xl:flex items-center gap-4 px-3 py-1 rounded-lg border border-slate-800 bg-slate-900/60 font-mono text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block leading-tight">NAV</span>
              <span className="font-semibold text-slate-200">$250,000.00</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 text-[10px] block leading-tight">DAY P&amp;L</span>
              <span className="font-semibold text-emerald-400">+$2,785.40 (+1.12%)</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 text-[10px] block leading-tight">RISK AT STAKE</span>
              <span className="font-medium text-amber-400">$1,250.00 (0.50%)</span>
            </div>
          </div>

          {/* Sound alert toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-slate-400 hover:text-slate-200 transition-colors ${
              soundEnabled ? 'border-slate-800 bg-slate-900 hover:border-slate-700' : 'border-slate-850 bg-slate-950 text-slate-600'
            }`}
            title={soundEnabled ? 'Audio alerts active' : 'Audio muted'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Alerts quick button */}
          <button
            onClick={() => setActiveView('alerts')}
            className="relative p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            title="Price & Technical Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </button>

          {/* Settings modal trigger */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-750 bg-slate-850 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-xs font-medium"
          >
            <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Credentials</span>
          </button>
        </div>
      </div>
    </header>
  );
};
