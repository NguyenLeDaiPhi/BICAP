package com.bicap.trading_order_service.repository;

import com.bicap.trading_order_service.entity.Order;

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
}
