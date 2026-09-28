package com.fintechstation.service;

import com.fintechstation.domain.enums.AssetClass;
import com.fintechstation.dto.ScannerFilterDto;
import com.fintechstation.dto.ScannerItemDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MarketScannerServiceTest {

    private MarketScannerService scannerService;

    @BeforeEach
    void setUp() {
        scannerService = new MarketScannerService();
    }

    @Test
    @DisplayName("Should filter instruments by AssetClass CRYPTO")
    void testFilterByAssetClassCrypto() {
        ScannerFilterDto filter = ScannerFilterDto.builder()
                .assetClass(AssetClass.CRYPTO)
                .build();

        List<ScannerItemDto> results = scannerService.scan(filter);
        assertNotNull(results);
        assertFalse(results.isEmpty());
        for (ScannerItemDto item : results) {
            assertEquals(AssetClass.CRYPTO, item.getAssetClass());
        }
    }

    @Test
    @DisplayName("Should search instruments by ticker symbol")
    void testSearchBySymbol() {
        ScannerFilterDto filter = ScannerFilterDto.builder()
                .searchQuery("NVDA")
                .build();

        List<ScannerItemDto> results = scannerService.scan(filter);
        assertEquals(1, results.size());
        assertEquals("NVDA", results.get(0).getSymbol());
    }

    @Test
    @DisplayName("Should sort instruments by 24h change percent in descending order")
    void testSorting() {
        ScannerFilterDto filter = ScannerFilterDto.builder()
                .sortBy("changePercent")
                .sortDirection("desc")
                .page(0)
                .size(10)
                .build();

        List<ScannerItemDto> results = scannerService.scan(filter);
        assertTrue(results.size() > 1);
        for (int i = 0; i < results.size() - 1; i++) {
            BigDecimal current = results.get(i).getChangePercent24h();
            BigDecimal next = results.get(i + 1).getChangePercent24h();
            assertTrue(current.compareTo(next) >= 0);
        }
    }

    @Test
    @DisplayName("Should provide market overview with status and key categories")
    void testMarketOverview() {
        var overview = scannerService.getMarketOverview();
        assertNotNull(overview);
        assertNotNull(overview.getTopGainers());
        assertNotNull(overview.getKeyIndices());
        assertNotNull(overview.getKeyForex());
        assertNotNull(overview.getKeyCrypto());
    }
}
