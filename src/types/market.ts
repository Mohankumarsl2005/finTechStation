export type AssetClass = 'STOCKS' | 'ETFS' | 'INDICES' | 'FOREX' | 'COMMODITIES' | 'CRYPTO';

export type LondonEdgeSignal = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export type MacdSignal = 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'NEUTRAL' | 'OVERBOUGHT' | 'OVERSOLD';

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  exchange: string;
  currency: string;
  sector?: string;
  marketCap?: number;
  isActive: boolean;
}

export interface MarketQuote {
  symbol: string;
  lastPrice: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  high52w: number;
  low52w: number;
  rsi14: number;
  macdSignal: MacdSignal;
  londonEdgeScore: number; // 0 - 100
  londonEdgeSignal: LondonEdgeSignal;
  isSimulatedFeed: boolean;
  feedDataSource: string; // "LONDON_STRATEGIC_EDGE_LIVE" | "DEMO_SIMULATION"
  timestamp: string;
}

export interface ScannerItem extends Instrument, MarketQuote {
  sparkline?: number[];
  inWatchlist?: boolean;
  momentum?: 'UP' | 'FLAT' | 'DOWN';
  statusBadge?: 'ANALYZE' | 'WATCH';
  setupType?: string;
  volumeDisplay?: string;
}

export interface ScannerFilterState {
  assetClass: AssetClass | 'ALL';
  searchQuery: string;
  preset: 'ALL' | 'GAINERS' | 'LOSERS' | 'VOLUME' | 'OVERSOLD' | 'OVERBOUGHT' | 'LONDON_STRONG_BUY';
  minPrice?: number;
  maxPrice?: number;
  minRsi?: number;
  maxRsi?: number;
  londonEdgeSignal?: LondonEdgeSignal | 'ALL';
  sortBy: 'changePercent24h' | 'lastPrice' | 'volume24h' | 'rsi14' | 'londonEdgeScore' | 'symbol';
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface MarketOverviewData {
  marketStatus: 'OPEN' | 'CLOSED' | 'WEEKEND';
  sessions: {
    london: { status: 'OPEN' | 'CLOSED' | 'PRE_MARKET'; countdown: string };
    newYork: { status: 'OPEN' | 'CLOSED' | 'PRE_MARKET'; countdown: string };
    tokyo: { status: 'OPEN' | 'CLOSED'; countdown: string };
    sydney: { status: 'OPEN' | 'CLOSED'; countdown: string };
  };
  feedMode: 'LIVE_FEED' | 'DEMO_SIMULATION';
  feedNotice: string;
  topGainers: ScannerItem[];
  topLosers: ScannerItem[];
  mostActive: ScannerItem[];
  keyIndices: ScannerItem[];
  keyForex: ScannerItem[];
  keyCrypto: ScannerItem[];
}

export interface WatchlistGroup {
  id: string;
  name: string;
  symbols: string[];
}

export interface AlertRule {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW' | 'RSI_OVERSOLD' | 'RSI_OVERBOUGHT' | 'LONDON_EDGE_BUY';
  triggered: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface JournalTrade {
  id: string;
  symbol: string;
  assetClass: AssetClass;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  pnlPercentage?: number;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  strategyTag: string;
  timeframe: string;
  notes: string;
  entryDate: string;
  exitDate?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: 'FOREX_FACTORY' | 'WORLD_MONITOR' | 'FINTECH_WIRE';
  publishedAt: string;
  url: string;
  impact?: 'HIGH' | 'MEDIUM' | 'LOW';
  currency?: string;
  forecast?: string;
  previous?: string;
  actual?: string;
  summary: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface TradingPlan {
  symbol: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  dailySetup: string;
  h4KeyLevel: number;
  m15Trigger: string;
  entryZone: { low: number; high: number };
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: number;
  riskPercentage: number;
  capitalAtRisk: number;
  positionSize: number;
}
