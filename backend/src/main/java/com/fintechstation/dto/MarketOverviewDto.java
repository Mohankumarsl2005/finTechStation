package com.fintechstation.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketOverviewDto {
    private String marketStatus; // "OPEN", "CLOSED", "WEEKEND"
    private String londonSessionStatus; // "ACTIVE", "CLOSED", "PRE_MARKET"
    private String nySessionStatus;
    private String tokyoSessionStatus;
    private String feedMode; // "LIVE" or "DEMO_SIMULATION"
    private String feedNotice;
    private List<ScannerItemDto> topGainers;
    private List<ScannerItemDto> topLosers;
    private List<ScannerItemDto> mostActive;
    private List<ScannerItemDto> keyIndices;
    private List<ScannerItemDto> keyForex;
    private List<ScannerItemDto> keyCrypto;
}
