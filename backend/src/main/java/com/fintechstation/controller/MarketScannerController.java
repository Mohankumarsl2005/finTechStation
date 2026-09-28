package com.fintechstation.controller;

import com.fintechstation.domain.enums.AssetClass;
import com.fintechstation.domain.enums.LondonEdgeSignal;
import com.fintechstation.dto.ScannerFilterDto;
import com.fintechstation.dto.ScannerItemDto;
import com.fintechstation.service.MarketScannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/scanner")
@RequiredArgsConstructor
@Tag(name = "Global Market Scanner", description = "Multi-asset institutional scanner with London Strategic Edge signals")
public class MarketScannerController {

    private final MarketScannerService scannerService;

    @GetMapping
    @Operation(summary = "Scan multi-asset instruments with technical filters and pagination")
    public ResponseEntity<Map<String, Object>> scanInstruments(
            @RequestParam(required = false) AssetClass assetClass,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRsi,
            @RequestParam(required = false) BigDecimal maxRsi,
            @RequestParam(required = false) LondonEdgeSignal londonEdgeSignal,
            @RequestParam(defaultValue = "changePercent") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size) {

        ScannerFilterDto filter = ScannerFilterDto.builder()
                .assetClass(assetClass)
                .searchQuery(search)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minRsi(minRsi)
                .maxRsi(maxRsi)
                .londonEdgeSignal(londonEdgeSignal)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .page(page)
                .size(size)
                .build();

        List<ScannerItemDto> items = scannerService.scan(filter);
        int total = scannerService.count(filter);

        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("page", page);
        response.put("size", size);
        response.put("total", total);
        response.put("totalPages", (int) Math.ceil((double) total / size));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{symbol}")
    @Operation(summary = "Get detailed scanner quote & London Strategic Edge technicals by symbol")
    public ResponseEntity<ScannerItemDto> getInstrumentDetails(@PathVariable String symbol) {
        ScannerItemDto item = scannerService.getBySymbol(symbol);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(item);
    }
}
