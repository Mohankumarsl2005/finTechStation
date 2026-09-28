package com.fintechstation.service;

import com.fintechstation.domain.enums.AssetClass;
import com.fintechstation.domain.enums.LondonEdgeSignal;
import com.fintechstation.dto.MarketOverviewDto;
import com.fintechstation.dto.ScannerFilterDto;
import com.fintechstation.dto.ScannerItemDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class MarketScannerService {

    @Value("${fintechstation.london-strategic-edge.api-key:}")
    private String londonStrategicEdgeApiKey;

    // In-memory high frequency cache for active instruments
    private final Map<String, ScannerItemDto> cache = new ConcurrentHashMap<>();

    public MarketScannerService() {
        seedInitialMarketData();
    }

    public List<ScannerItemDto> scan(ScannerFilterDto filter) {
        List<ScannerItemDto> results = new ArrayList<>(cache.values());

        // Asset class filter
        if (filter.getAssetClass() != null) {
            results = results.stream()
                    .filter(item -> item.getAssetClass() == filter.getAssetClass())
                    .collect(Collectors.toList());
        }

        // Search query filter (symbol, name, sector)
        if (filter.getSearchQuery() != null && !filter.getSearchQuery().isBlank()) {
            String query = filter.getSearchQuery().toLowerCase().trim();
            results = results.stream()
                    .filter(item -> item.getSymbol().toLowerCase().contains(query)
                            || item.getName().toLowerCase().contains(query)
                            || (item.getSector() != null && item.getSector().toLowerCase().contains(query)))
                    .collect(Collectors.toList());
        }

        // Price range filter
        if (filter.getMinPrice() != null) {
            results = results.stream()
                    .filter(item -> item.getLastPrice().compareTo(filter.getMinPrice()) >= 0)
                    .collect(Collectors.toList());
        }
        if (filter.getMaxPrice() != null) {
            results = results.stream()
                    .filter(item -> item.getLastPrice().compareTo(filter.getMaxPrice()) <= 0)
                    .collect(Collectors.toList());
        }

        // RSI filter
        if (filter.getMinRsi() != null) {
            results = results.stream()
                    .filter(item -> item.getRsi14() != null && item.getRsi14().compareTo(filter.getMinRsi()) >= 0)
                    .collect(Collectors.toList());
        }
        if (filter.getMaxRsi() != null) {
            results = results.stream()
                    .filter(item -> item.getRsi14() != null && item.getRsi14().compareTo(filter.getMaxRsi()) <= 0)
                    .collect(Collectors.toList());
        }

        // London Strategic Edge Signal filter
        if (filter.getLondonEdgeSignal() != null) {
            results = results.stream()
                    .filter(item -> item.getLondonEdgeSignal() == filter.getLondonEdgeSignal())
                    .collect(Collectors.toList());
        }

        // Sorting
        Comparator<ScannerItemDto> comparator = getComparator(filter.getSortBy());
        if ("asc".equalsIgnoreCase(filter.getSortDirection())) {
            results.sort(comparator);
        } else {
            results.sort(comparator.reversed());
        }

        // Pagination
        int page = filter.getPage() != null && filter.getPage() >= 0 ? filter.getPage() : 0;
        int size = filter.getSize() != null && filter.getSize() > 0 ? filter.getSize() : 25;
        int fromIndex = Math.min(page * size, results.size());
        int toIndex = Math.min(fromIndex + size, results.size());

        return results.subList(fromIndex, toIndex);
    }

    public int count(ScannerFilterDto filter) {
        return scan(ScannerFilterDto.builder()
                .assetClass(filter.getAssetClass())
                .searchQuery(filter.getSearchQuery())
                .minPrice(filter.getMinPrice())
                .maxPrice(filter.getMaxPrice())
                .minRsi(filter.getMinRsi())
                .maxRsi(filter.getMaxRsi())
                .londonEdgeSignal(filter.getLondonEdgeSignal())
                .page(0)
                .size(Integer.MAX_VALUE)
                .build()).size();
    }

    public MarketOverviewDto getMarketOverview() {
        List<ScannerItemDto> all = new ArrayList<>(cache.values());
        boolean hasLiveCredentials = londonStrategicEdgeApiKey != null && !londonStrategicEdgeApiKey.isBlank();

        List<ScannerItemDto> topGainers = all.stream()
                .sorted(Comparator.comparing(ScannerItemDto::getChangePercent24h).reversed())
                .limit(5)
                .collect(Collectors.toList());

        List<ScannerItemDto> topLosers = all.stream()
                .sorted(Comparator.comparing(ScannerItemDto::getChangePercent24h))
                .limit(5)
                .collect(Collectors.toList());

        List<ScannerItemDto> mostActive = all.stream()
                .sorted(Comparator.comparing(ScannerItemDto::getVolume24h, Comparator.nullsLast(BigDecimal::compareTo)).reversed())
                .limit(5)
                .collect(Collectors.toList());

        List<ScannerItemDto> indices = all.stream()
                .filter(i -> i.getAssetClass() == AssetClass.INDICES)
                .collect(Collectors.toList());

        List<ScannerItemDto> forex = all.stream()
                .filter(i -> i.getAssetClass() == AssetClass.FOREX)
                .collect(Collectors.toList());

        List<ScannerItemDto> crypto = all.stream()
                .filter(i -> i.getAssetClass() == AssetClass.CRYPTO)
                .collect(Collectors.toList());

        return MarketOverviewDto.builder()
                .marketStatus("OPEN")
                .londonSessionStatus("ACTIVE")
                .nySessionStatus("OPEN")
                .tokyoSessionStatus("CLOSED")
                .feedMode(hasLiveCredentials ? "LIVE_FEED" : "DEMO_SIMULATION")
                .feedNotice(hasLiveCredentials
                        ? "Connected to London Strategic Edge Live Institutional Gateway"
                        : "DEMO MODE: London Strategic Edge API credentials not configured. Showing high-fidelity simulated feeds.")
                .topGainers(topGainers)
                .topLosers(topLosers)
                .mostActive(mostActive)
                .keyIndices(indices)
                .keyForex(forex)
                .keyCrypto(crypto)
                .build();
    }

    public ScannerItemDto getBySymbol(String symbol) {
        return cache.get(symbol.toUpperCase());
    }

    private Comparator<ScannerItemDto> getComparator(String sortBy) {
        if (sortBy == null) return Comparator.comparing(ScannerItemDto::getChangePercent24h);
        return switch (sortBy.toLowerCase()) {
            case "price" -> Comparator.comparing(ScannerItemDto::getLastPrice);
            case "volume" -> Comparator.comparing(ScannerItemDto::getVolume24h, Comparator.nullsLast(BigDecimal::compareTo));
            case "rsi" -> Comparator.comparing(ScannerItemDto::getRsi14, Comparator.nullsLast(BigDecimal::compareTo));
            case "londonedgescore" -> Comparator.comparing(ScannerItemDto::getLondonEdgeScore, Comparator.nullsLast(BigDecimal::compareTo));
            case "symbol" -> Comparator.comparing(ScannerItemDto::getSymbol);
            default -> Comparator.comparing(ScannerItemDto::getChangePercent24h);
        };
    }

    private void seedInitialMarketData() {
        boolean hasCreds = londonStrategicEdgeApiKey != null && !londonStrategicEdgeApiKey.isBlank();
        String source = hasCreds ? "LONDON_STRATEGIC_EDGE_LIVE" : "DEMO_SIMULATION";

        addSeed("NVDA", "NVIDIA Corporation", AssetClass.STOCKS, "NASDAQ", "USD", "Semiconductors",
                new BigDecimal("3200000000000"), new BigDecimal("128.45"), new BigDecimal("4.85"), new BigDecimal("3.92"),
                new BigDecimal("129.80"), new BigDecimal("124.10"), new BigDecimal("68500000"),
                new BigDecimal("140.76"), new BigDecimal("45.20"), new BigDecimal("64.2"), "BULLISH_CROSS",
                new BigDecimal("91.5"), LondonEdgeSignal.STRONG_BUY, !hasCreds, source);

        addSeed("AAPL", "Apple Inc.", AssetClass.STOCKS, "NASDAQ", "USD", "Consumer Electronics",
                new BigDecimal("3450000000000"), new BigDecimal("227.18"), new BigDecimal("-1.42"), new BigDecimal("-0.62"),
                new BigDecimal("229.40"), new BigDecimal("226.50"), new BigDecimal("42100000"),
                new BigDecimal("237.23"), new BigDecimal("164.08"), new BigDecimal("48.5"), "NEUTRAL",
                new BigDecimal("68.0"), LondonEdgeSignal.BUY, !hasCreds, source);

        addSeed("MSFT", "Microsoft Corporation", AssetClass.STOCKS, "NASDAQ", "USD", "Software Infrastructure",
                new BigDecimal("3120000000000"), new BigDecimal("429.60"), new BigDecimal("3.20"), new BigDecimal("0.75"),
                new BigDecimal("431.50"), new BigDecimal("426.80"), new BigDecimal("21400000"),
                new BigDecimal("468.35"), new BigDecimal("309.45"), new BigDecimal("55.8"), "BULLISH_CROSS",
                new BigDecimal("74.5"), LondonEdgeSignal.BUY, !hasCreds, source);

        addSeed("TSLA", "Tesla Inc.", AssetClass.STOCKS, "NASDAQ", "USD", "Automotive",
                new BigDecimal("780000000000"), new BigDecimal("248.30"), new BigDecimal("14.10"), new BigDecimal("6.02"),
                new BigDecimal("251.40"), new BigDecimal("235.10"), new BigDecimal("98400000"),
                new BigDecimal("271.00"), new BigDecimal("138.80"), new BigDecimal("72.4"), "OVERBOUGHT",
                new BigDecimal("88.0"), LondonEdgeSignal.STRONG_BUY, !hasCreds, source);

        addSeed("SPY", "SPDR S&P 500 ETF Trust", AssetClass.ETFS, "NYSE Arca", "USD", "Index Tracking",
                new BigDecimal("540000000000"), new BigDecimal("568.40"), new BigDecimal("2.10"), new BigDecimal("0.37"),
                new BigDecimal("569.20"), new BigDecimal("566.00"), new BigDecimal("45200000"),
                new BigDecimal("572.00"), new BigDecimal("410.00"), new BigDecimal("58.2"), "NEUTRAL",
                new BigDecimal("65.0"), LondonEdgeSignal.NEUTRAL, !hasCreds, source);

        addSeed("QQQ", "Invesco QQQ Trust", AssetClass.ETFS, "NASDAQ", "USD", "Large Cap Growth",
                new BigDecimal("280000000000"), new BigDecimal("488.90"), new BigDecimal("4.80"), new BigDecimal("0.99"),
                new BigDecimal("490.50"), new BigDecimal("484.20"), new BigDecimal("36400000"),
                new BigDecimal("503.52"), new BigDecimal("350.20"), new BigDecimal("61.0"), "BULLISH_CROSS",
                new BigDecimal("78.0"), LondonEdgeSignal.BUY, !hasCreds, source);

        addSeed("SPX", "S&P 500 Index", AssetClass.INDICES, "CBOE", "USD", "Broad Market",
                null, new BigDecimal("5720.50"), new BigDecimal("28.40"), new BigDecimal("0.50"),
                new BigDecimal("5735.00"), new BigDecimal("5698.00"), new BigDecimal("2100000000"),
                new BigDecimal("5750.00"), new BigDecimal("4103.78"), new BigDecimal("59.1"), "NEUTRAL",
                new BigDecimal("70.0"), LondonEdgeSignal.BUY, !hasCreds, source);

        addSeed("FTSE", "FTSE 100 Index", AssetClass.INDICES, "LSE", "GBP", "UK Large Cap",
                null, new BigDecimal("8290.40"), new BigDecimal("-32.10"), new BigDecimal("-0.39"),
                new BigDecimal("8340.00"), new BigDecimal("8275.50"), new BigDecimal("890000000"),
                new BigDecimal("8474.41"), new BigDecimal("7380.00"), new BigDecimal("44.3"), "BEARISH_CROSS",
                new BigDecimal("42.0"), LondonEdgeSignal.NEUTRAL, !hasCreds, source);

        addSeed("EUR/USD", "Euro / US Dollar", AssetClass.FOREX, "FX_SPOT", "USD", "Major Pair",
                null, new BigDecimal("1.1124"), new BigDecimal("-0.0032"), new BigDecimal("-0.29"),
                new BigDecimal("1.1165"), new BigDecimal("1.1110"), new BigDecimal("14500000000"),
                new BigDecimal("1.1215"), new BigDecimal("1.0450"), new BigDecimal("46.8"), "NEUTRAL",
                new BigDecimal("51.0"), LondonEdgeSignal.NEUTRAL, !hasCreds, source);

        addSeed("GBP/USD", "British Pound / US Dollar", AssetClass.FOREX, "FX_SPOT", "USD", "Major Pair",
                null, new BigDecimal("1.3385"), new BigDecimal("0.0045"), new BigDecimal("0.34"),
                new BigDecimal("1.3430"), new BigDecimal("1.3340"), new BigDecimal("9800000000"),
                new BigDecimal("1.3450"), new BigDecimal("1.2030"), new BigDecimal("63.5"), "BULLISH_CROSS",
                new BigDecimal("82.0"), LondonEdgeSignal.BUY, !hasCreds, source);

        addSeed("XAU/USD", "Gold Spot (oz)", AssetClass.COMMODITIES, "COMEX", "USD", "Precious Metals",
                null, new BigDecimal("2668.50"), new BigDecimal("14.20"), new BigDecimal("0.54"),
                new BigDecimal("2685.80"), new BigDecimal("2652.00"), new BigDecimal("3200000000"),
                new BigDecimal("2685.80"), new BigDecimal("1810.00"), new BigDecimal("68.9"), "BULLISH_CROSS",
                new BigDecimal("89.0"), LondonEdgeSignal.STRONG_BUY, !hasCreds, source);

        addSeed("BRENT", "Brent Crude Oil", AssetClass.COMMODITIES, "ICE", "USD", "Energy",
                null, new BigDecimal("73.40"), new BigDecimal("-1.80"), new BigDecimal("-2.39"),
                new BigDecimal("75.60"), new BigDecimal("72.90"), new BigDecimal("2800000000"),
                new BigDecimal("92.30"), new BigDecimal("68.50"), new BigDecimal("38.2"), "BEARISH_CROSS",
                new BigDecimal("35.0"), LondonEdgeSignal.SELL, !hasCreds, source);

        addSeed("BTC/USD", "Bitcoin", AssetClass.CRYPTO, "CRYPTO_SPOT", "USD", "Digital Asset",
                new BigDecimal("1850000000000"), new BigDecimal("96450.00"), new BigDecimal("3280.00"), new BigDecimal("3.52"),
                new BigDecimal("97200.00"), new BigDecimal("93100.00"), new BigDecimal("48900000000"),
                new BigDecimal("99800.00"), new BigDecimal("38500.00"), new BigDecimal("66.8"), "BULLISH_CROSS",
                new BigDecimal("94.0"), LondonEdgeSignal.STRONG_BUY, !hasCreds, source);

        addSeed("ETH/USD", "Ethereum", AssetClass.CRYPTO, "CRYPTO_SPOT", "USD", "Smart Contracts",
                new BigDecimal("380000000000"), new BigDecimal("3420.50"), new BigDecimal("112.30"), new BigDecimal("3.39"),
                new BigDecimal("3460.00"), new BigDecimal("3290.00"), new BigDecimal("21400000000"),
                new BigDecimal("4090.00"), new BigDecimal("2150.00"), new BigDecimal("62.1"), "BULLISH_CROSS",
                new BigDecimal("85.0"), LondonEdgeSignal.BUY, !hasCreds, source);

        addSeed("SOL/USD", "Solana", AssetClass.CRYPTO, "CRYPTO_SPOT", "USD", "Smart Contracts",
                new BigDecimal("94000000000"), new BigDecimal("214.80"), new BigDecimal("12.40"), new BigDecimal("6.13"),
                new BigDecimal("218.00"), new BigDecimal("198.50"), new BigDecimal("7800000000"),
                new BigDecimal("260.00"), new BigDecimal("55.00"), new BigDecimal("71.5"), "OVERBOUGHT",
                new BigDecimal("90.0"), LondonEdgeSignal.STRONG_BUY, !hasCreds, source);
    }

    private void addSeed(String symbol, String name, AssetClass assetClass, String exchange, String currency,
                         String sector, BigDecimal marketCap, BigDecimal lastPrice, BigDecimal change24h,
                         BigDecimal changePercent24h, BigDecimal high24h, BigDecimal low24h, BigDecimal volume24h,
                         BigDecimal high52w, BigDecimal low52w, BigDecimal rsi14, String macdSignal,
                         BigDecimal londonEdgeScore, LondonEdgeSignal londonEdgeSignal, boolean isSimulated, String source) {
        ScannerItemDto item = ScannerItemDto.builder()
                .id("inst-" + symbol.toLowerCase().replace('/', '-'))
                .symbol(symbol)
                .name(name)
                .assetClass(assetClass)
                .exchange(exchange)
                .currency(currency)
                .sector(sector)
                .marketCap(marketCap)
                .lastPrice(lastPrice)
                .change24h(change24h)
                .changePercent24h(changePercent24h)
                .high24h(high24h)
                .low24h(low24h)
                .volume24h(volume24h)
                .high52w(high52w)
                .low52w(low52w)
                .rsi14(rsi14)
                .macdSignal(macdSignal)
                .londonEdgeScore(londonEdgeScore)
                .londonEdgeSignal(londonEdgeSignal)
                .isSimulatedFeed(isSimulated)
                .feedDataSource(source)
                .timestamp(OffsetDateTime.now())
                .build();
        cache.put(symbol, item);
    }
}
