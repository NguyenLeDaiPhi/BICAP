package com.bicap.trading_order_service.repository;

import com.bicap.trading_order_service.entity.MarketplaceProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarketplaceProductRepository
        extends JpaRepository<MarketplaceProduct, Long> {

    // Retailer xem danh sách sản phẩm đã duyệt
    List<MarketplaceProduct> findByStatus(String status);

    // Retailer xem chi tiết sản phẩm đã duyệt
    Optional<MarketplaceProduct> findByIdAndStatus(Long id, String status);
}
