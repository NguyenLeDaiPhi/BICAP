package com.bicap.trading_order_service.repository;

import com.bicap.trading_order_service.entity.Order;

import java.util.List;
import java.util.Optional;

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

     @Query("""
        SELECT o FROM Order o
        WHERE o.buyerEmail = :buyerEmail
        ORDER BY o.createdAt DESC
    """)
    List<Order> findOrdersByBuyerEmail(@Param("buyerEmail") String buyerEmail);

     Optional<Order> findByIdAndBuyerEmail(Long id, String buyerEmail);

}
