package com.fintechstation.domain.entity;

import com.fintechstation.domain.enums.AssetClass;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "instruments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Instrument {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, unique = true, length = 32)
    private String symbol;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_class", nullable = false, length = 32)
    private AssetClass assetClass;

    @Column(nullable = false, length = 64)
    private String exchange;

    @Column(nullable = false, length = 16)
    private String currency;

    @Column(length = 128)
    private String sector;

    @Column(name = "market_cap", precision = 20, scale = 2)
    private BigDecimal marketCap;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
