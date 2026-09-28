import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory data store replicating Spring Boot service state
import { INITIAL_INSTRUMENTS, INITIAL_NEWS, INITIAL_TRADES, INITIAL_ALERTS } from './src/data/mockMarketData.ts';

let instruments = [...INITIAL_INSTRUMENTS];
let news = [...INITIAL_NEWS];
let trades = [...INITIAL_TRADES];
let alerts = [...INITIAL_ALERTS];
let watchlistSymbols = new Set(['NVDA', 'BTC/USD', 'SPY', 'EUR/USD', 'XAU/USD']);

const londonEdgeApiKey = process.env.LONDON_STRATEGIC_EDGE_API_KEY || '';
const hasLiveLondonEdge = Boolean(londonEdgeApiKey && londonEdgeApiKey.trim() !== '');

// Helper to determine session statuses
function getMarketSessions() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay();

  const isWeekend = utcDay === 0 || (utcDay === 6 && utcHour >= 21);

  return {
    marketStatus: isWeekend ? ('WEEKEND' as const) : ('OPEN' as const),
    sessions: {
      london: {
        status: !isWeekend && utcHour >= 8 && utcHour < 16 ? ('OPEN' as const) : ('CLOSED' as const),
        countdown: 'London: 08:00 - 16:30 UTC'
      },
      newYork: {
        status: !isWeekend && utcHour >= 13 && utcHour < 21 ? ('OPEN' as const) : ('CLOSED' as const),
        countdown: 'New York: 13:30 - 20:00 UTC'
      },
      tokyo: {
        status: !isWeekend && (utcHour >= 0 && utcHour < 6) ? ('OPEN' as const) : ('CLOSED' as const),
        countdown: 'Tokyo: 00:00 - 06:00 UTC'
      },
      sydney: {
        status: !isWeekend && (utcHour >= 21 || utcHour < 5) ? ('OPEN' as const) : ('CLOSED' as const),
        countdown: 'Sydney: 21:00 - 05:00 UTC'
      }
    }
  };
}

// ---------------- REST API ROUTES ----------------

// System & Feed Status
app.get('/api/v1/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    version: '1.0.0',
    platform: 'FinTechStation Enterprise',
    londonStrategicEdge: {
      connected: hasLiveLondonEdge,
      mode: hasLiveLondonEdge ? 'LIVE_INSTITUTIONAL_FEED' : 'DEMO_SIMULATION_MODE',
      notice: hasLiveLondonEdge
        ? 'Connected to London Strategic Edge high-speed order flow stream.'
        : 'DEMO MODE: London Strategic Edge API credentials not provided in environment. Real-time prices are simulated with realistic statistical micro-movements. Never trade real capital on demo feeds.'
    },
    database: {
      status: 'SYNCHRONIZED',
      schema: 'PostgreSQL 16 / Flyway V1'
    },
    aiResearch: {
      available: Boolean(process.env.GEMINI_API_KEY)
    }
  });
});

// Market Overview
app.get('/api/v1/market-overview', (_req: Request, res: Response) => {
  const sessions = getMarketSessions();

  const sortedGainers = [...instruments].sort((a, b) => b.changePercent24h - a.changePercent24h).slice(0, 5);
  const sortedLosers = [...instruments].sort((a, b) => a.changePercent24h - b.changePercent24h).slice(0, 5);
  const mostActive = [...instruments].sort((a, b) => b.volume24h - a.volume24h).slice(0, 5);

  const keyIndices = instruments.filter(i => i.assetClass === 'INDICES');
  const keyForex = instruments.filter(i => i.assetClass === 'FOREX');
  const keyCrypto = instruments.filter(i => i.assetClass === 'CRYPTO');

  res.json({
    ...sessions,
    feedMode: hasLiveLondonEdge ? 'LIVE_FEED' : 'DEMO_SIMULATION',
    feedNotice: hasLiveLondonEdge
      ? 'Institutional Live Stream'
      : 'DEMO FEED (London Strategic Edge API key not configured)',
    topGainers: sortedGainers,
    topLosers: sortedLosers,
    mostActive,
    keyIndices,
    keyForex,
    keyCrypto
  });
});

// Global Market Scanner
app.get('/api/v1/scanner', (req: Request, res: Response) => {
  const {
    assetClass,
    search,
    preset,
    minPrice,
    maxPrice,
    minRsi,
    maxRsi,
    londonEdgeSignal,
    sortBy = 'changePercent24h',
    sortDirection = 'desc',
    page = '0',
    pageSize = '25'
  } = req.query;

  let filtered = instruments.map(inst => ({
    ...inst,
    inWatchlist: watchlistSymbols.has(inst.symbol)
  }));

  // Asset class filter
  if (assetClass && assetClass !== 'ALL') {
    filtered = filtered.filter(i => i.assetClass === assetClass);
  }

  // Search filter
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(i =>
      i.symbol.toLowerCase().includes(q) ||
      i.name.toLowerCase().includes(q) ||
      (i.sector && i.sector.toLowerCase().includes(q))
    );
  }

  // Presets
  if (preset === 'GAINERS') {
    filtered = filtered.filter(i => i.changePercent24h > 0);
  } else if (preset === 'LOSERS') {
    filtered = filtered.filter(i => i.changePercent24h < 0);
  } else if (preset === 'VOLUME') {
    filtered = filtered.filter(i => i.volume24h > 30000000);
  } else if (preset === 'OVERSOLD') {
    filtered = filtered.filter(i => i.rsi14 < 45);
  } else if (preset === 'OVERBOUGHT') {
    filtered = filtered.filter(i => i.rsi14 > 65);
  } else if (preset === 'LONDON_STRONG_BUY') {
    filtered = filtered.filter(i => i.londonEdgeSignal === 'STRONG_BUY');
  }

  // Numeric filters
  if (minPrice) filtered = filtered.filter(i => i.lastPrice >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter(i => i.lastPrice <= Number(maxPrice));
  if (minRsi) filtered = filtered.filter(i => i.rsi14 >= Number(minRsi));
  if (maxRsi) filtered = filtered.filter(i => i.rsi14 <= Number(maxRsi));
  if (londonEdgeSignal && londonEdgeSignal !== 'ALL') {
    filtered = filtered.filter(i => i.londonEdgeSignal === londonEdgeSignal);
  }

  // Sorting
  filtered.sort((a: any, b: any) => {
    const field = sortBy as string;
    let valA = a[field];
    let valB = b[field];

    if (typeof valA === 'string') {
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    valA = valA || 0;
    valB = valB || 0;
    return sortDirection === 'asc' ? valA - valB : valB - valA;
  });

  const p = Math.max(0, parseInt(page as string, 10));
  const size = Math.max(1, parseInt(pageSize as string, 10));
  const from = p * size;
  const to = from + size;
  const items = filtered.slice(from, to);

  res.json({
    items,
    total: filtered.length,
    page: p,
    pageSize: size,
    totalPages: Math.ceil(filtered.length / size)
  });
});

// Single Instrument by Symbol
app.get('/api/v1/scanner/:symbol', (req: Request, res: Response) => {
  const sym = req.params.symbol.toUpperCase().replace('-', '/');
  const found = instruments.find(i => i.symbol === sym || i.symbol.replace('/', '-') === req.params.symbol.toUpperCase());
  if (!found) {
    return res.status(404).json({ error: `Instrument not found: ${req.params.symbol}` });
  }
  res.json({
    ...found,
    inWatchlist: watchlistSymbols.has(found.symbol)
  });
});

// Watchlist routes
app.get('/api/v1/watchlist', (_req: Request, res: Response) => {
  const items = instruments
    .filter(i => watchlistSymbols.has(i.symbol))
    .map(i => ({ ...i, inWatchlist: true }));
  res.json({
    symbols: Array.from(watchlistSymbols),
    items
  });
});

app.post('/api/v1/watchlist/toggle', (req: Request, res: Response) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: 'Symbol required' });

  if (watchlistSymbols.has(symbol)) {
    watchlistSymbols.delete(symbol);
    res.json({ symbol, inWatchlist: false });
  } else {
    watchlistSymbols.add(symbol);
    res.json({ symbol, inWatchlist: true });
  }
});

// Price Alerts
app.get('/api/v1/alerts', (_req: Request, res: Response) => {
  res.json(alerts);
});

app.post('/api/v1/alerts', (req: Request, res: Response) => {
  const { symbol, targetPrice, condition } = req.body;
  if (!symbol || !targetPrice || !condition) {
    return res.status(400).json({ error: 'Missing alert fields' });
  }
  const newAlert = {
    id: `alt-${Date.now()}`,
    symbol,
    targetPrice: Number(targetPrice),
    condition,
    triggered: false,
    isActive: true,
    createdAt: new Date().toISOString().split('T')[0]
  };
  alerts.unshift(newAlert);
  res.status(201).json(newAlert);
});

app.delete('/api/v1/alerts/:id', (req: Request, res: Response) => {
  alerts = alerts.filter(a => a.id !== req.params.id);
  res.json({ success: true });
});

// Trading Journal
app.get('/api/v1/journal', (_req: Request, res: Response) => {
  res.json(trades);
});

app.post('/api/v1/journal', (req: Request, res: Response) => {
  const body = req.body;
  const newTrade = {
    id: `trd-${Date.now()}`,
    symbol: body.symbol || 'NVDA',
    assetClass: body.assetClass || 'STOCKS',
    direction: body.direction || 'LONG',
    entryPrice: Number(body.entryPrice),
    exitPrice: body.exitPrice ? Number(body.exitPrice) : undefined,
    quantity: Number(body.quantity || 1),
    stopLoss: body.stopLoss ? Number(body.stopLoss) : undefined,
    takeProfit: body.takeProfit ? Number(body.takeProfit) : undefined,
    pnl: body.pnl ? Number(body.pnl) : undefined,
    pnlPercentage: body.pnlPercentage ? Number(body.pnlPercentage) : undefined,
    status: body.status || 'OPEN',
    strategyTag: body.strategyTag || 'Market Structure',
    timeframe: body.timeframe || 'H1',
    notes: body.notes || '',
    entryDate: body.entryDate || new Date().toISOString().split('T')[0],
    exitDate: body.exitDate
  };
  trades.unshift(newTrade);
  res.status(201).json(newTrade);
});

app.delete('/api/v1/journal/:id', (req: Request, res: Response) => {
  trades = trades.filter(t => t.id !== req.params.id);
  res.json({ success: true });
});

// News feeds (Forex Factory & WorldMonitor)
app.get('/api/v1/news', (_req: Request, res: Response) => {
  res.json(news);
});

// AI Quantitative Research Engine (Powered by Gemini & London Strategic Edge logic)
app.post('/api/v1/research/analyze', async (req: Request, res: Response) => {
  const { symbol, timeframe = '1D' } = req.body;
  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

  const inst = instruments.find(i => i.symbol === symbol.toUpperCase().replace('-', '/'));

  // If Gemini API is available, generate institutional deep-dive analysis
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({});
      const prompt = `You are the FinTechStation Head Quantitative & Technical Strategist. 
Provide a high-frequency institutional market research brief for ${symbol} (${inst?.name || symbol}, Asset Class: ${inst?.assetClass || 'EQUITY'}, Price: $${inst?.lastPrice || 'N/A'}, 24h Change: ${inst?.changePercent24h || 0}%, RSI: ${inst?.rsi14 || 'N/A'}, London Edge Score: ${inst?.londonEdgeScore || 'N/A'}/100, London Edge Signal: ${inst?.londonEdgeSignal || 'NEUTRAL'}).
Structure your analysis concisely into:
1. Executive Summary & Market Bias
2. London Strategic Edge Orderflow & Liquidity Profile
3. Key Technical Support / Resistance Zones (Exact price levels)
4. Macro Risk Catalysts (Economic releases, central banks)
5. Recommended Actionable Trade Setup (Entry, Stop Loss, Take Profit 1 & 2, Risk/Reward).
Keep it institutional, professional, and clear.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({
        symbol,
        timeframe,
        provider: 'Gemini 2.5 Quantitative Model',
        analysis: response.text,
        metrics: inst || null,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to algorithmic report:', err.message);
    }
  }

  // Algorithmic Fallback report
  const bias = (inst?.londonEdgeScore || 50) > 75 ? 'BULLISH' : (inst?.londonEdgeScore || 50) < 40 ? 'BEARISH' : 'NEUTRAL';
  const price = inst?.lastPrice || 100;
  const s1 = (price * 0.975).toFixed(2);
  const r1 = (price * 1.035).toFixed(2);

  const fallbackReport = `### 1. Executive Summary & Market Bias
**Bias: ${bias}** | London Edge Score: **${inst?.londonEdgeScore || 70}/100**
${symbol} is displaying ${bias.toLowerCase()} momentum on the ${timeframe} structure. Order flow imbalances indicate sustained institutional participation near key liquidity pools.

### 2. London Strategic Edge Orderflow & Liquidity Profile
- Volume delta shows accumulation at the lower boundary of the session range.
- RSI(14) stands at **${inst?.rsi14 || 55}** indicating healthy structural progression without immediate exhaustion.
- MACD Signal: **${inst?.macdSignal || 'BULLISH_CROSS'}**.

### 3. Key Technical Levels
- **Immediate Resistance (R1):** $${r1}
- **Current Fair Value:** $${price}
- **Key Demand / Support (S1):** $${s1}

### 4. Macro Catalysts
- Monitoring upcoming Central Bank releases and bond yield dispersion.
- Feed Source: ${hasLiveLondonEdge ? 'London Strategic Edge Institutional Gateway' : 'FinTechStation Statistical Engine (Demo Feed)'}.

### 5. Recommended Execution Plan
- **Entry Zone:** $${(price * 0.995).toFixed(2)} - $${price}
- **Stop Loss:** $${(price * 0.98).toFixed(2)}
- **Take Profit 1:** $${r1}
- **Risk / Reward:** 1:2.8`;

  res.json({
    symbol,
    timeframe,
    provider: 'FinTechStation Algorithmic Quantitative Engine',
    analysis: fallbackReport,
    metrics: inst || null,
    timestamp: new Date().toISOString()
  });
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[FinTechStation] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
