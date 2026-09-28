package com.fintechstation.domain.entity;

import com.fintechstation.domain.enums.LondonEdgeSignal;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "market_quotes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketQuote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instrument_id", nullable = false)
    private Instrument instrument;

    @Column(nullable = false, length = 32)
    private String symbol;

    @Column(name = "last_price", nullable = false, precision = 18, scale = 6)
    private BigDecimal lastPrice;

    @Column(name = "change_24h", nullable = false, precision = 18, scale = 6)
    private BigDecimal change24h;

    @Column(name = "change_percent_24h", nullable = false, precision = 10, scale = 4)
    private BigDecimal changePercent24h;

    @Column(name = "high_24h", precision = 18, scale = 6)
    private BigDecimal high24h;

    @Column(name = "low_24h", precision = 18, scale = 6)
    private BigDecimal low24h;

    @Column(name = "volume_24h", precision = 24, scale = 2)
    private BigDecimal volume24h;

    @Column(name = "high_52w", precision = 18, scale = 6)
    private BigDecimal high52w;

    @Column(name = "low_52w", precision = 18, scale = 6)
    private BigDecimal low52w;

    @Column(name = "rsi_14", precision = 6, scale = 2)
    private BigDecimal rsi14;

    @Column(name = "macd_signal", length = 32)
    private String macdSignal;

    @Column(name = "london_edge_score", precision = 5, scale = 2)
    private BigDecimal londonEdgeScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "london_edge_signal", length = 32)
    private LondonEdgeSignal londonEdgeSignal;

    @Column(name = "is_simulated_feed")
    private Boolean isSimulatedFeed = false;

    @Column(name = "feed_timestamp")
    private OffsetDateTime feedTimestamp = OffsetDateTime.now();
}
