import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LiveTickerTape } from './components/dashboard/LiveTickerTape';
import { QuickMacroBar } from './components/dashboard/QuickMacroBar';
import { MarketOverviewCards } from './components/dashboard/MarketOverviewCards';
import { GlobalMarketScanner } from './components/scanner/GlobalMarketScanner';
import { InteractiveChart } from './components/chart/InteractiveChart';
import { TradingPlanModule } from './components/plan/TradingPlanModule';
import { AiResearchModule } from './components/research/AiResearchModule';
import { NewsModule } from './components/news/NewsModule';
import { TradingJournalModule } from './components/journal/TradingJournalModule';
import { WatchlistModule } from './components/watchlist/WatchlistModule';
import { AlertsModule } from './components/alerts/AlertsModule';
import { SettingsModal } from './components/settings/SettingsModal';
import { SearchModal } from './components/search/SearchModal';
import { api } from './services/api';
import { 
  ScannerItem, 
  MarketOverviewData, 
  AlertRule, 
  JournalTrade, 
  NewsItem 
} from './types/market';
import { INITIAL_INSTRUMENTS, INITIAL_NEWS, INITIAL_TRADES, INITIAL_ALERTS } from './data/mockMarketData';

export default function App() {
  const [activeView, setActiveView] = useState('scanner');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [overview, setOverview] = useState<MarketOverviewData | null>(null);
  const [instruments, setInstruments] = useState<ScannerItem[]>(INITIAL_INSTRUMENTS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(
    new Set(['BTC', 'ETH', 'SOL', 'NVDA', 'TSLA'])
  );
  const [alerts, setAlerts] = useState<AlertRule[]>(INITIAL_ALERTS);
  const [trades, setTrades] = useState<JournalTrade[]>(INITIAL_TRADES);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load initial backend data
  useEffect(() => {
    const initData = async () => {
      const [ov, wl, alt, jnl, nw] = await Promise.all([
        api.getMarketOverview(),
        api.getWatchlist(),
        api.getAlerts(),
        api.getJournal(),
        api.getNews()
      ]);
      setOverview(ov);
      if (alt) setAlerts(alt);
      if (jnl) setTrades(jnl);
      if (nw) setNews(nw);
      if (wl) {
        setWatchlistSymbols(new Set(wl.map((i) => i.symbol)));
      }
    };
    initData();
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleToggleWatchlist = async (symbol: string) => {
    await api.toggleWatchlist(symbol);
    setWatchlistSymbols((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  const handleSelectInstrument = (item: ScannerItem) => {
    setSelectedSymbol(item.symbol);
    setActiveView('chart');
  };

  const handleOpenChart = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveView('chart');
  };

  const handleOpenTradingPlan = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveView('plan');
  };

  const handleAddTrade = async (trade: Partial<JournalTrade>) => {
    const created = await api.addJournalTrade(trade);
    setTrades((prev) => [created, ...prev]);
  };

  const handleDeleteTrade = async (id: string) => {
    await api.deleteJournalTrade(id);
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateAlert = async (symbol: string, targetPrice: number, condition: string) => {
    const created = await api.createAlert(symbol, targetPrice, condition);
    setAlerts((prev) => [created, ...prev]);
  };

  const handleDeleteAlert = async (id: string) => {
    await api.deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const watchlistItems = instruments.filter((i) => watchlistSymbols.has(i.symbol));

  return (
    <div className="flex h-screen w-screen flex-col bg-[#090D16] text-slate-100 overflow-hidden font-sans">
      {/* Station Navbar */}
      <Navbar
        overview={overview}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Real-time Ticker Tape Banner */}
      <LiveTickerTape
        items={instruments}
        onSelectSymbol={(sym) => {
          setSelectedSymbol(sym);
          setActiveView('chart');
        }}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={(view) => {
            if (view === 'settings') {
              setIsSettingsOpen(true);
            } else {
              setActiveView(view);
            }
          }}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          watchlistCount={watchlistSymbols.size}
          alertCount={alerts.length}
        />

        {/* Dynamic View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 bg-[#F8FAFC] text-slate-900 transition-colors">
          {/* VIEW: DASHBOARD */}
          {activeView === 'dashboard' && (
            <div className="space-y-5">
              {/* Macro Benchmark Bar */}
              <QuickMacroBar />

              {/* Market Overview Cards */}
              <MarketOverviewCards
                keyIndices={overview?.keyIndices || instruments.filter((i) => i.assetClass === 'INDICES')}
                keyForex={overview?.keyForex || instruments.filter((i) => i.assetClass === 'FOREX')}
                keyCrypto={overview?.keyCrypto || instruments.filter((i) => i.assetClass === 'CRYPTO')}
                onSelectInstrument={handleSelectInstrument}
              />

              {/* Functional Global Market Scanner */}
              <GlobalMarketScanner
                onSelectInstrument={handleSelectInstrument}
                onOpenChart={handleOpenChart}
                onOpenTradingPlan={handleOpenTradingPlan}
                onOpenAlertModal={(item) => {
                  setSelectedSymbol(item.symbol);
                  setActiveView('alerts');
                }}
                onToggleWatchlist={handleToggleWatchlist}
                watchlistSymbols={watchlistSymbols}
              />
            </div>
          )}

          {/* VIEW: SCANNER */}
          {activeView === 'scanner' && (
            <GlobalMarketScanner
              onSelectInstrument={handleSelectInstrument}
              onOpenChart={handleOpenChart}
              onOpenTradingPlan={handleOpenTradingPlan}
              onOpenAlertModal={(item) => {
                setSelectedSymbol(item.symbol);
                setActiveView('alerts');
              }}
              onToggleWatchlist={handleToggleWatchlist}
              watchlistSymbols={watchlistSymbols}
            />
          )}

          {/* VIEW: CHART */}
          {activeView === 'chart' && (
            <InteractiveChart
              selectedSymbol={selectedSymbol}
              instruments={instruments}
              onSelectSymbol={setSelectedSymbol}
              onOpenTradingPlan={handleOpenTradingPlan}
            />
          )}

          {/* VIEW: TRADING PLAN */}
          {activeView === 'plan' && (
            <TradingPlanModule
              initialSymbol={selectedSymbol}
              instruments={instruments}
              onSaveToJournal={handleAddTrade}
            />
          )}

          {/* VIEW: AI RESEARCH */}
          {activeView === 'research' && (
            <AiResearchModule
              instruments={instruments}
              defaultSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
            />
          )}

          {/* VIEW: NEWS */}
          {activeView === 'news' && <NewsModule news={news} />}

          {/* VIEW: JOURNAL */}
          {activeView === 'journal' && (
            <TradingJournalModule
              trades={trades}
              onAddTrade={handleAddTrade}
              onDeleteTrade={handleDeleteTrade}
            />
          )}

          {/* VIEW: WATCHLIST */}
          {activeView === 'watchlist' && (
            <WatchlistModule
              watchlistItems={watchlistItems}
              onToggleWatchlist={handleToggleWatchlist}
              onOpenChart={handleOpenChart}
              onOpenTradingPlan={handleOpenTradingPlan}
            />
          )}

          {/* VIEW: ALERTS */}
          {activeView === 'alerts' && (
            <AlertsModule
              alerts={alerts}
              instruments={instruments}
              onCreateAlert={handleCreateAlert}
              onDeleteAlert={handleDeleteAlert}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        instruments={instruments}
        onSelectInstrument={handleSelectInstrument}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDemoFeed={overview?.feedMode === 'DEMO_SIMULATION'}
      />
    </div>
  );
}
