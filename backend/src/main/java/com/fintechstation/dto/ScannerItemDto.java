package com.fintechstation.dto;

import com.fintechstation.domain.enums.AssetClass;
import com.fintechstation.domain.enums.LondonEdgeSignal;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScannerItemDto {
    private String id;
    private String symbol;
    private String name;
    private AssetClass assetClass;
    private String exchange;
    private String currency;
    private String sector;
    private BigDecimal marketCap;
    
    // Quote & technicals
    private BigDecimal lastPrice;
    private BigDecimal change24h;
    private BigDecimal changePercent24h;
    private BigDecimal high24h;
    private BigDecimal low24h;
    private BigDecimal volume24h;
    private BigDecimal high52w;
    private BigDecimal low52w;
    private BigDecimal rsi14;
    private String macdSignal;
    
    // London Strategic Edge analysis
    private BigDecimal londonEdgeScore;
    private LondonEdgeSignal londonEdgeSignal;
    private Boolean isSimulatedFeed;
    private String feedDataSource; // "LONDON_STRATEGIC_EDGE_LIVE" or "DEMO_SIMULATED_FEED"
    private OffsetDateTime timestamp;
}
