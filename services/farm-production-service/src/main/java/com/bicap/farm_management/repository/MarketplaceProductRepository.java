package com.bicap.farm_management.repository;

import com.bicap.farm_management.entity.MarketplaceProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceProductRepository extends JpaRepository<MarketplaceProduct, Long> {
}