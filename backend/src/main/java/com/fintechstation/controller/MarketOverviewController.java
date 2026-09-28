package com.fintechstation.controller;

import com.fintechstation.dto.MarketOverviewDto;
import com.fintechstation.service.MarketScannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/market-overview")
@RequiredArgsConstructor
@Tag(name = "Market Overview", description = "Global market sessions, gainers/losers, and macro status")
public class MarketOverviewController {

    private final MarketScannerService scannerService;

    @GetMapping
    @Operation(summary = "Get global market sessions, macro benchmarks, and London Strategic Edge status")
    public ResponseEntity<MarketOverviewDto> getOverview() {
        return ResponseEntity.ok(scannerService.getMarketOverview());
    }
}
