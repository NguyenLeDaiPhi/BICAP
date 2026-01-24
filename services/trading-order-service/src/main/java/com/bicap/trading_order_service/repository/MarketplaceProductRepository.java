package com.bicap.trading_order_service.repository;

import com.bicap.trading_order_service.entity.MarketplaceProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceProductRepository
        extends JpaRepository<MarketplaceProduct, Long>,
                JpaSpecificationExecutor<MarketplaceProduct> {

    // ===============================
    // FARM MANAGER
    // ===============================
    @Query("SELECT p FROM MarketplaceProduct p WHERE p.farmManager.farmId = :farmId")
    List<MarketplaceProduct> findByFarmId(@Param("farmId") Long farmId);

    // ===============================
    // COMMON
    // ===============================
    List<MarketplaceProduct> findByStatus(String status);

    // Giữ method này (merge từ HEAD + main)
    @Query("SELECT p FROM MarketplaceProduct p " +
           "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<MarketplaceProduct> findByNameContainingIgnoreCase(
            @Param("keyword") String keyword);

    long countByStatus(String status);

    // ===============================
    // ADMIN – FILTER + PAGING
    // ===============================
    @Query("""
        SELECT p FROM MarketplaceProduct p
        LEFT JOIN p.farmManager fm
        WHERE (:keyword IS NULL OR :keyword = '' 
               OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:status IS NULL OR :status = '' OR p.status = :status)
          AND (:farmId IS NULL OR fm.farmId = :farmId)
    """)
    Page<MarketplaceProduct> findWithFilters(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("farmId") Long farmId,
            Pageable pageable
    );
}
