package com.bicap.trading_order_service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.bicap.trading_order_service.entity.Order;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public class OrderResponse {

    private Long orderId;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;

    // Danh sách items
    private List<OrderItemResponse> items;

    // Delivery images (uploaded by retailer when receiving products)
    private List<String> deliveryImages;
    
    // Delivery confirmed timestamp
    private LocalDateTime deliveryConfirmedAt;

    /* ===== CONSTRUCTORS ===== */

    public OrderResponse(Long orderId,
                         BigDecimal totalAmount,
                         String status,
                         LocalDateTime createdAt) {
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Constructor với items
    public OrderResponse(Long orderId,
                         BigDecimal totalAmount,
                         String status,
                         LocalDateTime createdAt,
                         List<OrderItemResponse> items) {
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.items = items;
    }

    /* ===== FACTORY METHOD ===== */

    public static OrderResponse fromEntity(Order order) {
        return fromEntity(order, new ObjectMapper());
    }

    public static OrderResponse fromEntity(Order order, ObjectMapper objectMapper) {

        List<OrderItemResponse> items = order.getItems()
            .stream()
            .map(item -> new OrderItemResponse(
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getUnitPrice()
            ))
            .toList();

        // Parse delivery images JSON
        List<String> deliveryImages = null;
        if (order.getDeliveryImages() != null && !order.getDeliveryImages().isEmpty()) {
            try {
                deliveryImages = objectMapper.readValue(
                    order.getDeliveryImages(),
                    new TypeReference<List<String>>() {}
                );
            } catch (Exception e) {
                // If parsing fails, set to empty list
                deliveryImages = List.of();
            }
        }

        OrderResponse response = new OrderResponse(
                order.getId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                items
        );
        response.setDeliveryImages(deliveryImages);
        response.setDeliveryConfirmedAt(order.getDeliveryConfirmedAt());
        
        return response;
    }

    /* ===== GETTERS ===== */

    public Long getOrderId() {
        return orderId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public List<String> getDeliveryImages() {
        return deliveryImages;
    }

    public void setDeliveryImages(List<String> deliveryImages) {
        this.deliveryImages = deliveryImages;
    }

    public LocalDateTime getDeliveryConfirmedAt() {
        return deliveryConfirmedAt;
    }

    public void setDeliveryConfirmedAt(LocalDateTime deliveryConfirmedAt) {
        this.deliveryConfirmedAt = deliveryConfirmedAt;
    }
}
