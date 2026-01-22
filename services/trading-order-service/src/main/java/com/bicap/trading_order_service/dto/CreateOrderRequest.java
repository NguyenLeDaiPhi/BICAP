package com.bicap.trading_order_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import java.util.List;

public class CreateOrderRequest {

    // ✅ THAY buyerId → buyerEmail
    @NotNull
    @Email
    private String buyerEmail;

    @NotNull
    private List<OrderItemRequest> items;

    public String getBuyerEmail() {
        return buyerEmail;
    }

    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
