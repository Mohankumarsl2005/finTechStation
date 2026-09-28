-- FinTechStation V1 Schema Migration
-- Defines core entities for Instruments, Market Quotes, Watchlists, Alerts, and Trading Journal

CREATE TABLE IF NOT EXISTS instruments (
    id VARCHAR(64) PRIMARY KEY,
    symbol VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    asset_class VARCHAR(32) NOT NULL, -- STOCKS, ETFS, INDICES, FOREX, COMMODITIES, CRYPTO
    exchange VARCHAR(64) NOT NULL,
    currency VARCHAR(16) NOT NULL,
    sector VARCHAR(128),
    market_cap NUMERIC(20, 2),
    shares_outstanding NUMERIC(20, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_instruments_asset_class ON instruments(asset_class);
CREATE INDEX idx_instruments_symbol ON instruments(symbol);

CREATE TABLE IF NOT EXISTS market_quotes (
    id BIGSERIAL PRIMARY KEY,
    instrument_id VARCHAR(64) NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    symbol VARCHAR(32) NOT NULL,
    last_price NUMERIC(18, 6) NOT NULL,
    change_24h NUMERIC(18, 6) NOT NULL,
    change_percent_24h NUMERIC(10, 4) NOT NULL,
    high_24h NUMERIC(18, 6),
    low_24h NUMERIC(18, 6),
    open_price NUMERIC(18, 6),
    previous_close NUMERIC(18, 6),
    volume_24h NUMERIC(24, 2),
    high_52w NUMERIC(18, 6),
    low_52w NUMERIC(18, 6),
    rsi_14 NUMERIC(6, 2),
    macd_signal VARCHAR(32), -- BULLISH_CROSS, BEARISH_CROSS, NEUTRAL, OVERBOUGHT, OVERSOLD
    london_edge_score NUMERIC(5, 2), -- 0 - 100
    london_edge_signal VARCHAR(32), -- STRONG_BUY, BUY, NEUTRAL, SELL, STRONG_SELL
    is_simulated_feed BOOLEAN DEFAULT FALSE,
    feed_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quotes_symbol ON market_quotes(symbol);
CREATE INDEX idx_quotes_timestamp ON market_quotes(feed_timestamp DESC);

CREATE TABLE IF NOT EXISTS watchlists (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlist_items (
    id BIGSERIAL PRIMARY KEY,
    watchlist_id VARCHAR(64) NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    instrument_symbol VARCHAR(32) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT uq_watchlist_symbol UNIQUE (watchlist_id, instrument_symbol)
);

CREATE TABLE IF NOT EXISTS price_alerts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    condition_type VARCHAR(32) NOT NULL, -- PRICE_ABOVE, PRICE_BELOW, RSI_ABOVE, RSI_BELOW, LONDON_EDGE_SIGNAL
    target_value NUMERIC(18, 6) NOT NULL,
    is_triggered BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trading_journal (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    asset_class VARCHAR(32) NOT NULL,
    direction VARCHAR(16) NOT NULL, -- LONG, SHORT
    entry_price NUMERIC(18, 6) NOT NULL,
    exit_price NUMERIC(18, 6),
    quantity NUMERIC(18, 6) NOT NULL,
    stop_loss NUMERIC(18, 6),
    take_profit NUMERIC(18, 6),
    pnl NUMERIC(18, 2),
    pnl_percentage NUMERIC(8, 4),
    status VARCHAR(32) NOT NULL, -- OPEN, CLOSED, CANCELLED
    strategy_tag VARCHAR(64),
    timeframe VARCHAR(16),
    notes TEXT,
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial instruments across all asset classes
INSERT INTO instruments (id, symbol, name, asset_class, exchange, currency, sector, market_cap) VALUES
('inst-1', 'NVDA', 'NVIDIA Corporation', 'STOCKS', 'NASDAQ', 'USD', 'Semiconductors', 3200000000000),
('inst-2', 'AAPL', 'Apple Inc.', 'STOCKS', 'NASDAQ', 'USD', 'Consumer Electronics', 3450000000000),
('inst-3', 'MSFT', 'Microsoft Corporation', 'STOCKS', 'NASDAQ', 'USD', 'Software Infrastructure', 3120000000000),
('inst-4', 'AMZN', 'Amazon.com Inc.', 'STOCKS', 'NASDAQ', 'USD', 'Internet Retail', 2140000000000),
('inst-5', 'GOOGL', 'Alphabet Inc. Class A', 'STOCKS', 'NASDAQ', 'USD', 'Internet Content', 2210000000000),
('inst-6', 'TSLA', 'Tesla Inc.', 'STOCKS', 'NASDAQ', 'USD', 'Automotive', 780000000000),
('inst-7', 'SPY', 'SPDR S&P 500 ETF Trust', 'ETFS', 'NYSE Arca', 'USD', 'Index Tracking', 540000000000),
('inst-8', 'QQQ', 'Invesco QQQ Trust', 'ETFS', 'NASDAQ', 'USD', 'Large Cap Growth', 280000000000),
('inst-9', 'SPX', 'S&P 500 Index', 'INDICES', 'CBOE', 'USD', 'Broad Market', NULL),
('inst-10', 'NDX', 'Nasdaq 100 Index', 'INDICES', 'NASDAQ', 'USD', 'Technology', NULL),
('inst-11', 'FTSE', 'FTSE 100 Index', 'INDICES', 'LSE', 'GBP', 'UK Large Cap', NULL),
('inst-12', 'EUR/USD', 'Euro / US Dollar', 'FOREX', 'FX_SPOT', 'USD', 'Major Pair', NULL),
('inst-13', 'GBP/USD', 'British Pound / US Dollar', 'FOREX', 'FX_SPOT', 'USD', 'Major Pair', NULL),
('inst-14', 'USD/JPY', 'US Dollar / Japanese Yen', 'FOREX', 'FX_SPOT', 'JPY', 'Major Pair', NULL),
('inst-15', 'XAU/USD', 'Gold Spot (oz)', 'COMMODITIES', 'COMEX', 'USD', 'Precious Metals', NULL),
('inst-16', 'BRENT', 'Brent Crude Oil (bbl)', 'COMMODITIES', 'ICE', 'USD', 'Energy', NULL),
('inst-17', 'BTC/USD', 'Bitcoin', 'CRYPTO', 'CRYPTO_SPOT', 'USD', 'Digital Asset', 1850000000000),
('inst-18', 'ETH/USD', 'Ethereum', 'CRYPTO', 'CRYPTO_SPOT', 'USD', 'Smart Contracts', 380000000000),
('inst-19', 'SOL/USD', 'Solana', 'CRYPTO', 'CRYPTO_SPOT', 'USD', 'Smart Contracts', 94000000000);
