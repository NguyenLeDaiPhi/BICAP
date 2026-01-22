package com.bicap.trading_order_service.repository;

import com.bicap.trading_order_service.entity.MarketplaceProduct;
<<<<<<< HEAD
import org.springframework.data.jpa.repository.JpaRepository;
=======
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
>>>>>>> admin_service
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
<<<<<<< HEAD
public interface MarketplaceProductRepository extends JpaRepository<MarketplaceProduct, Long> {

    @Query("SELECT p FROM MarketplaceProduct p WHERE p.farmManager.farmId = :farmId")
    List<MarketplaceProduct> findByFarmId(@Param("farmId") Long farmId);
=======
public interface MarketplaceProductRepository extends JpaRepository<MarketplaceProduct, Long>, JpaSpecificationExecutor<MarketplaceProduct> {

    @Query("SELECT p FROM MarketplaceProduct p WHERE p.farmManager.farmId = :farmId")
    List<MarketplaceProduct> findByFarmId(@Param("farmId") Long farmId);

    // Tìm sản phẩm theo status
    List<MarketplaceProduct> findByStatus(String status);

    // Tìm sản phẩm theo tên (LIKE)
    @Query("SELECT p FROM MarketplaceProduct p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<MarketplaceProduct> findByNameContainingIgnoreCase(@Param("keyword") String keyword);

    // Đếm số sản phẩm theo status
    long countByStatus(String status);

    // Admin: Tìm kiếm với bộ lọc (keyword, status, farmId) với phân trang
    // Sử dụng LEFT JOIN để lấy cả sản phẩm không có farmManager
    @Query("SELECT p FROM MarketplaceProduct p LEFT JOIN p.farmManager fm " +
           "WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR p.status = :status) " +
           "AND (:farmId IS NULL OR fm.farmId = :farmId)")
    Page<MarketplaceProduct> findWithFilters(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("farmId") Long farmId,
            Pageable pageable);
>>>>>>> admin_service
}