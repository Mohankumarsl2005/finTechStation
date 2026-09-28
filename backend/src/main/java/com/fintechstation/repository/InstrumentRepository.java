package com.fintechstation.repository;

import com.fintechstation.domain.entity.Instrument;
import com.fintechstation.domain.enums.AssetClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InstrumentRepository extends JpaRepository<Instrument, String> {
    Optional<Instrument> findBySymbol(String symbol);
    List<Instrument> findByAssetClass(AssetClass assetClass);
    List<Instrument> findByIsActiveTrue();
}
