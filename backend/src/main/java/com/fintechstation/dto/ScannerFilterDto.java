package com.fintechstation.dto;

import com.fintechstation.domain.enums.AssetClass;
import com.fintechstation.domain.enums.LondonEdgeSignal;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScannerFilterDto {
    private AssetClass assetClass;
    private String searchQuery;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minVolume;
    private BigDecimal minRsi;
    private BigDecimal maxRsi;
    private LondonEdgeSignal londonEdgeSignal;
    private String sortBy; // symbol, price, changePercent, volume, rsi, londonEdgeScore
    private String sortDirection; // asc, desc
    private Integer page;
    private Integer size;
}
