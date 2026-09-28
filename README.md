# FinTechStation

> Institutional-Grade Multi-Asset Market Terminal, Real-Time Scanner, Technical Charting, and Quantitative Intelligence Platform.

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-KRaft-black.svg)](https://kafka.apache.org/)
[![Spark](https://img.shields.io/badge/Apache%20Spark-3.5-red.svg)](https://spark.apache.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

---

## 1. System Architecture Overview

FinTechStation is built upon an enterprise-grade distributed financial computing architecture designed to process high-frequency ticks, execute multi-asset algorithmic screening, and manage risk parameters:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FinTechStation Frontend                         │
│   React 19 + TypeScript + Vite + Tailwind CSS v4 (Port 3000)                │
│   - Global Market Scanner (Stocks, ETFs, Indices, Forex, Commodities, Crypto)│
│   - Interactive Candlestick & Volume Charts with EMA 20/50 & TradingView     │
│   - Multi-Timeframe Trading Plan & Position Sizing Calculator               │
│   - LangChain / Gemini AI Quantitative Research Analyst                     │
│   - Forex Factory & WorldMonitor Macro Intelligence                         │
│   - Calendar Trading Journal & Performance Analytics                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST / WebSocket
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    Spring Boot 3 / Java 21 Backend (Port 8080)              │
│   - MarketScannerService (Multi-asset filtering & sorting engine)           │
│   - London Strategic Edge Gateway (Order flow & liquidity depth)           │
│   - Spring Data JPA + Flyway Database Migrations                           │
│   - Spring Security Stateless Token Authentication                         │
│   - Springdoc OpenAPI / Swagger 3 (/swagger-ui.html)                       │
└──────────────────┬───────────────────┬──────────────────────┬───────────────┘
                   │                   │                      │
┌──────────────────▼───┐ ┌─────────────▼────────┐ ┌───────────▼───────────────┐
│   PostgreSQL 16      │ │  Apache Kafka        │ │   Apache Spark 3.5        │
│   Relational Schema  │ │  Distributed Streams │ │   Distributed Quant Engine│
│   Port: 5432         │ │  Port: 9092          │ │   Master Port: 7077 / 8081│
└──────────────────────┘ └──────────────────────┘ └───────────────────────────┘
```

---

## 2. Implemented Features (First Working Version)

### Module 1: Global Multi-Asset Market Scanner (Core Deliverable)
- **Asset Classes Supported:**
  - **Stocks:** NVDA, AAPL, MSFT, TSLA, AMZN, AMD, PLTR, etc.
  - **ETFs:** SPY, QQQ, SMH, etc.
  - **Indices:** S&P 500 (SPX), Nasdaq 100 (NDX), FTSE 100, DAX 40.
  - **Forex:** EUR/USD, GBP/USD, USD/JPY.
  - **Commodities:** XAU/USD (Gold Spot), Brent Crude (BRENT).
  - **Cryptocurrencies:** BTC/USD, ETH/USD, SOL/USD.
- **Filtering & Search:**
  - Real-time text search by symbol, asset name, or industry sector.
  - Preset filters: "Top Gainers", "Top Losers", "High Volume Breakout", "RSI Oversold (<45)", "RSI Overbought (>65)", "London Strategic Edge Strong Buy".
  - Sliders for Price Range ($), RSI (14) Range, and London Edge Signal classification.
- **Sorting & Pagination:**
  - Interactive ascending/descending sorting on all columns (Price, 24h Return, Volume, RSI, London Edge Score).
  - Configurable page size (10, 25, 50 rows) with boundary navigation.
- **Real-Time Flashing Ticks:**
  - Micro-price adjustments triggering green/red visual flashes.
- **Institutional Feed Transparency:**
  - Clear label distinguishing between **Live London Strategic Edge Gateway** and **High-Fidelity Simulated Feeds** when credentials are not configured.

### Module 2: Interactive Chart Analysis
- Responsive multi-timeframe Candlestick & Volume chart (1M, 5M, 15M, 1H, 4H, 1D).
- Dynamic EMA 20 (Orange) and EMA 50 (Cyan) indicators.
- Live hover crosshair with high-precision OHLC values.
- Embedded TradingView Advanced Chart widget fallback option.

### Module 3: Multi-Timeframe Trading Plan & Risk Sizing
- 3-tier structure: 1D Macro Bias $\rightarrow$ 4H Key Level $\rightarrow$ 15M Execution Trigger.
- Strict capital preservation formula: calculates units to buy based on portfolio balance ($250,000) and max risk percent (1%).
- Auto-calculated Risk / Reward ratio and projected target profit at TP1/TP2.
- Direct commit to Trading Journal.

### Module 4: LangChain / Gemini AI Research Engine
- Quantitative financial brief generator powered by Gemini 2.5 Flash / LangChain patterns.
- Order flow delta, institutional liquidity imbalances, support/resistance matrices, and risk factors.

### Module 5: News & Macro Intelligence
- Forex Factory High-Impact Economic Calendar (CPI, NFP, Interest Rate decisions) with Forecast vs Previous vs Actual values.
- WorldMonitor geopolitical headlines with sentiment tagging.

### Module 6: Trading Journal & Performance Analytics
- Key metrics: Total Realized P&L, Win Rate (%), Profit Factor, Execution Discipline.
- Interactive modal to log executed trades with strategy tags and notes.

### Module 7: Watchlists & Real-Time Alerts
- One-click Star toggle from scanner rows.
- Price threshold and technical condition triggers (Above, Below, RSI Oversold/Overbought).

---

## 3. Running the Application

### Option A: Local Full-Stack (Interactive AI Studio / Node Server)
```bash
# 1. Install dependencies
npm install

# 2. Run the application (Starts Express full-stack backend & Vite frontend on port 3000)
npm run dev

# 3. Access in browser
http://localhost:3000
```

### Option B: Docker Compose (PostgreSQL, Kafka, Spark, Spring Boot, Frontend)
```bash
# Start all infrastructure containers
docker compose up -d

# Verify services
docker compose ps

# Access endpoints:
# - Frontend: http://localhost:3000
# - Spring Boot Backend: http://localhost:8080/api/v1/scanner
# - Swagger UI: http://localhost:8080/swagger-ui.html
# - Spark Master UI: http://localhost:8081
# - Kafka Broker: localhost:9092
# - PostgreSQL: localhost:5432 (Database: fintechstation)
```

### Option C: Spring Boot 3 Backend Direct Run
```bash
cd backend
mvn clean spring-boot:run
```

---

## 4. Testing & Verification

Run the Maven unit tests:
```bash
cd backend
mvn test
```

Execute frontend lint & type checking:
```bash
npm run lint
npm run build
```

---

## 5. Configuration & Feed Credentials

To transition from the high-fidelity demo feed to live London Strategic Edge feeds:
1. Provide your institutional API key in `.env`:
   ```env
   LONDON_STRATEGIC_EDGE_API_KEY="your_api_key_here"
   LONDON_STRATEGIC_EDGE_API_URL="https://api.londonstrategicedge.com/v1"
   ```
2. Or enter it directly in the terminal UI via the top **Credentials** button.
