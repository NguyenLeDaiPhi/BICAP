package com.bicap.trading_order_service.repository;

import com.bicap.trading_order_service.entity.MarketplaceProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceProductRepository extends JpaRepository<MarketplaceProduct, Long> {

    @Query("SELECT p FROM MarketplaceProduct p WHERE p.farmManager.farmId = :farmId")
    List<MarketplaceProduct> findByFarmId(@Param("farmId") Long farmId);

    List<MarketplaceProduct> findByNameContainingIgnoreCase(String name);
}