package com.bicap.trading_order_service.repository;

import com.bicap.trading_order_service.entity.OrderFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderFeedbackRepository extends JpaRepository<OrderFeedback, Long> {
}
