package com.fintechstation.repository;

import com.fintechstation.domain.entity.MarketQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarketQuoteRepository extends JpaRepository<MarketQuote, Long> {
    Optional<MarketQuote> findTopBySymbolOrderByFeedTimestampDesc(String symbol);

    @Query(value = "SELECT DISTINCT ON (symbol) * FROM market_quotes ORDER BY symbol, feed_timestamp DESC", nativeQuery = true)
    List<MarketQuote> findLatestQuotesForAllSymbols();

    @Query(value = "SELECT q.* FROM market_quotes q " +
                   "JOIN instruments i ON q.instrument_id = i.id " +
                   "WHERE i.asset_class = :assetClass " +
                   "ORDER BY q.feed_timestamp DESC", nativeQuery = true)
    List<MarketQuote> findLatestQuotesByAssetClass(@Param("assetClass") String assetClass);
}
