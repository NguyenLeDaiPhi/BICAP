package com.bicap.trading_order_service.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderCompletedEvent {

    private Long orderId;
    private Long buyerId;
    private BigDecimal totalAmount;
    private String completedAt; // 🔥 STRING, KHÔNG LocalDateTime

    public OrderCompletedEvent(Long orderId, Long buyerId, BigDecimal totalAmount) {
        this.orderId = orderId;
        this.buyerId = buyerId;
        this.totalAmount = totalAmount;
        this.completedAt = LocalDateTime.now().toString();
    }

    public Long getOrderId() {
        return orderId;
    }

    public Long getBuyerId() {
        return buyerId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getCompletedAt() {
        return completedAt;
    }
}
