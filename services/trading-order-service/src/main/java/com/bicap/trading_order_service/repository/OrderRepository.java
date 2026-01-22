package com.bicap.trading_order_service.repository;

import com.bicap.trading_order_service.entity.Order;

<<<<<<< HEAD
=======
import java.math.BigDecimal;
import java.time.LocalDateTime;
>>>>>>> admin_service
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("""
    SELECT DISTINCT o FROM Order o 
    JOIN o.items i 
    JOIN i.product p 
    WHERE p.farmManager.farmId = :farmId
    """)
    List<Order> findOrdersByFarmId(@Param("farmId") Long farmId);
<<<<<<< HEAD
=======

    // Đếm đơn hàng theo status
    long countByStatus(String status);

    // Đếm đơn hàng trong khoảng thời gian
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate")
    long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Đếm đơn hàng theo status trong khoảng thời gian
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND o.createdAt >= :startDate AND o.createdAt < :endDate")
    long countByStatusAndCreatedAtBetween(
            @Param("status") String status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Tính tổng doanh thu (đơn hàng COMPLETED)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED'")
    BigDecimal calculateTotalRevenue();

    // Tính doanh thu trong ngày (đơn hàng COMPLETED)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate AND o.createdAt < :endDate")
    BigDecimal calculateRevenueByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Tính doanh thu ước tính (đơn hàng CREATED + CONFIRMED)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN ('CREATED', 'CONFIRMED')")
    BigDecimal calculateEstimatedPendingRevenue();

    // Lấy đơn hàng trong ngày
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate ORDER BY o.createdAt DESC")
    List<Order> findOrdersToday(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // === ADMIN APIs ===
    // Lấy tất cả đơn hàng
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findAllOrdersForAdmin();

    // Lấy đơn hàng theo trạng thái
    List<Order> findByStatusOrderByCreatedAtDesc(String status);
>>>>>>> admin_service
}
