package com.bicap.trading_order_service.event;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class OrderCompletedEvent implements Serializable {
    private Long orderId;
    private Long buyerId;
    private BigDecimal totalAmount;

    public OrderCompletedEvent() {
    }

    public OrderCompletedEvent(Long orderId, Long buyerId, BigDecimal totalAmount) {
        this.orderId = orderId;
        this.buyerId = buyerId;
        this.totalAmount = totalAmount;
    }
}
