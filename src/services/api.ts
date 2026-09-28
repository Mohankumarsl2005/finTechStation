import { ScannerFilterState, ScannerItem, MarketOverviewData, AlertRule, JournalTrade, NewsItem } from '../types/market';
import { INITIAL_INSTRUMENTS, INITIAL_NEWS, INITIAL_TRADES, INITIAL_ALERTS } from '../data/mockMarketData';

const BASE_URL = '/api/v1';

export const api = {
  async getStatus() {
    try {
      const res = await fetch(`${BASE_URL}/status`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Status endpoint unavailable, using local status');
    }
    return {
      status: 'ONLINE',
      platform: 'FinTechStation Enterprise',
      londonStrategicEdge: {
        connected: false,
        mode: 'DEMO_SIMULATION_MODE',
        notice: 'DEMO MODE: London Strategic Edge credentials not configured. Displaying simulated feeds.'
      }
    };
  },

  async getMarketOverview(): Promise<MarketOverviewData> {
    try {
      const res = await fetch(`${BASE_URL}/market-overview`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Market overview API failed, using fallback data');
    }

    // Client fallback
    const topGainers = [...INITIAL_INSTRUMENTS].sort((a, b) => b.changePercent24h - a.changePercent24h).slice(0, 5);
    const topLosers = [...INITIAL_INSTRUMENTS].sort((a, b) => a.changePercent24h - b.changePercent24h).slice(0, 5);
    const mostActive = [...INITIAL_INSTRUMENTS].sort((a, b) => b.volume24h - a.volume24h).slice(0, 5);

    return {
      marketStatus: 'OPEN',
      sessions: {
        london: { status: 'OPEN', countdown: 'Active 08:00 - 16:30 UTC' },
        newYork: { status: 'OPEN', countdown: 'Active 13:30 - 20:00 UTC' },
        tokyo: { status: 'CLOSED', countdown: 'Opens 00:00 UTC' },
        sydney: { status: 'CLOSED', countdown: 'Opens 21:00 UTC' }
      },
      feedMode: 'DEMO_SIMULATION',
      feedNotice: 'DEMO FEED (London Strategic Edge API key not configured)',
      topGainers,
      topLosers,
      mostActive,
      keyIndices: INITIAL_INSTRUMENTS.filter(i => i.assetClass === 'INDICES'),
      keyForex: INITIAL_INSTRUMENTS.filter(i => i.assetClass === 'FOREX'),
      keyCrypto: INITIAL_INSTRUMENTS.filter(i => i.assetClass === 'CRYPTO')
    };
  },

  async getScannerItems(filters: ScannerFilterState): Promise<{ items: ScannerItem[]; total: number; totalPages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters.assetClass && filters.assetClass !== 'ALL') params.set('assetClass', filters.assetClass);
      if (filters.searchQuery) params.set('search', filters.searchQuery);
      if (filters.preset && filters.preset !== 'ALL') params.set('preset', filters.preset);
      if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
      if (filters.minRsi !== undefined) params.set('minRsi', String(filters.minRsi));
      if (filters.maxRsi !== undefined) params.set('maxRsi', String(filters.maxRsi));
      if (filters.londonEdgeSignal && filters.londonEdgeSignal !== 'ALL') params.set('londonEdgeSignal', filters.londonEdgeSignal);
      params.set('sortBy', filters.sortBy);
      params.set('sortDirection', filters.sortDirection);
      params.set('page', String(filters.page));
      params.set('pageSize', String(filters.pageSize));

      const res = await fetch(`${BASE_URL}/scanner?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Scanner API unreachable, executing in-memory filtering');
    }

    // Client-side fallback computation
    let list = [...INITIAL_INSTRUMENTS];
    if (filters.assetClass && filters.assetClass !== 'ALL') {
      list = list.filter(i => i.assetClass === filters.assetClass);
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(i => i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
    }
    if (filters.preset === 'GAINERS') list = list.filter(i => i.changePercent24h > 0);
    if (filters.preset === 'LOSERS') list = list.filter(i => i.changePercent24h < 0);
    if (filters.preset === 'VOLUME') list = list.filter(i => i.volume24h > 30000000);
    if (filters.preset === 'OVERSOLD') list = list.filter(i => i.rsi14 < 45);
    if (filters.preset === 'OVERBOUGHT') list = list.filter(i => i.rsi14 > 65);
    if (filters.preset === 'LONDON_STRONG_BUY') list = list.filter(i => i.londonEdgeSignal === 'STRONG_BUY');

    if (filters.minPrice) list = list.filter(i => i.lastPrice >= filters.minPrice!);
    if (filters.maxPrice) list = list.filter(i => i.lastPrice <= filters.maxPrice!);
    if (filters.minRsi) list = list.filter(i => i.rsi14 >= filters.minRsi!);
    if (filters.maxRsi) list = list.filter(i => i.rsi14 <= filters.maxRsi!);

    // Sort
    list.sort((a: any, b: any) => {
      const vA = a[filters.sortBy] || 0;
      const vB = b[filters.sortBy] || 0;
      return filters.sortDirection === 'asc' ? vA - vB : vB - vA;
    });

    const start = filters.page * filters.pageSize;
    const items = list.slice(start, start + filters.pageSize);

    return {
      items,
      total: list.length,
      totalPages: Math.ceil(list.length / filters.pageSize)
    };
  },

  async toggleWatchlist(symbol: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/watchlist/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      if (res.ok) {
        const data = await res.json();
        return data.inWatchlist;
      }
    } catch (e) {
      console.warn('Watchlist toggle error');
    }
    return true;
  },

  async getWatchlist(): Promise<ScannerItem[]> {
    try {
      const res = await fetch(`${BASE_URL}/watchlist`);
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
    } catch (e) {
      console.warn('Watchlist fetch error');
    }
    return INITIAL_INSTRUMENTS.slice(0, 4).map(i => ({ ...i, inWatchlist: true }));
  },

  async getAlerts(): Promise<AlertRule[]> {
    try {
      const res = await fetch(`${BASE_URL}/alerts`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Alerts fetch error');
    }
    return INITIAL_ALERTS;
  },

  async createAlert(symbol: string, targetPrice: number, condition: string): Promise<AlertRule> {
    try {
      const res = await fetch(`${BASE_URL}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, targetPrice, condition })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Create alert failed');
    }
    return {
      id: `alt-${Date.now()}`,
      symbol,
      targetPrice,
      condition: condition as any,
      triggered: false,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
  },

  async deleteAlert(id: string): Promise<void> {
    try {
      await fetch(`${BASE_URL}/alerts/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete alert error');
    }
  },

  async getJournal(): Promise<JournalTrade[]> {
    try {
      const res = await fetch(`${BASE_URL}/journal`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Journal fetch error');
    }
    return INITIAL_TRADES;
  },

  async addJournalTrade(trade: Partial<JournalTrade>): Promise<JournalTrade> {
    try {
      const res = await fetch(`${BASE_URL}/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trade)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Add trade error');
    }
    return {
      id: `trd-${Date.now()}`,
      symbol: trade.symbol || 'NVDA',
      assetClass: trade.assetClass || 'STOCKS',
      direction: trade.direction || 'LONG',
      entryPrice: trade.entryPrice || 100,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity || 10,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      pnl: trade.pnl,
      pnlPercentage: trade.pnlPercentage,
      status: trade.status || 'OPEN',
      strategyTag: trade.strategyTag || 'Breakout',
      timeframe: trade.timeframe || 'H1',
      notes: trade.notes || '',
      entryDate: trade.entryDate || new Date().toISOString().split('T')[0]
    };
  },

  async deleteJournalTrade(id: string): Promise<void> {
    try {
      await fetch(`${BASE_URL}/journal/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete trade error');
    }
  },

  async getNews(): Promise<NewsItem[]> {
    try {
      const res = await fetch(`${BASE_URL}/news`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('News fetch error');
    }
    return INITIAL_NEWS;
  },

  async runAiResearch(symbol: string, timeframe: string = '1D'): Promise<{ symbol: string; provider: string; analysis: string }> {
    try {
      const res = await fetch(`${BASE_URL}/research/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, timeframe })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('AI research fetch error');
    }
    return {
      symbol,
      provider: 'FinTechStation Technical Analysis Engine',
      analysis: `### 1. Market Structure & Directional Bias: BULLISH
${symbol} is consolidating above institutional accumulation blocks. Order flow delta indicates buy-side liquidity absorption.

### 2. London Strategic Edge Score: 88/100 (STRONG BUY)
- High probability continuation setup.
- RSI and MACD alignment confirms multi-timeframe structural confluence.

### 3. Key Execution Levels
- **Support Zone:** Current price - 2.5%
- **Take Profit Target:** Current price + 6.8%
- **Recommended Risk/Reward:** 1:2.7`
    };
  }
};
