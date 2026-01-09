package com.bicap.trading_order_service.controller;

import com.bicap.trading_order_service.dto.CreateOrderRequest;
import com.bicap.trading_order_service.dto.OrderResponse;
import com.bicap.trading_order_service.service.IOrderService;
import com.bicap.trading_order_service.service.OrderService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final IOrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Retailer tạo đơn hàng
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestBody CreateOrderRequest request) {

        return ResponseEntity.ok(orderService.createOrder(request));
    }

    /**
     * Hoàn tất đơn hàng (sau khi giao xong)
     */
    @PutMapping("/{orderId}/complete")
    public ResponseEntity<OrderResponse> completeOrder(@PathVariable Long orderId) {
        OrderResponse response = orderService.completeOrder(orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public List<OrderResponse> getOrdersByFarm(
            @RequestParam Long farmId
    ) {
        return orderService.getOrdersByFarm(farmId);
    }

    /**
     * Farm xác nhận đơn hàng
     */
    @PutMapping("/{orderId}/confirm")
    public OrderResponse confirmOrder(
            @PathVariable Long orderId
    ) {
        return orderService.confirmOrder(orderId);
    }

    /**
     * Farm từ chối đơn hàng
     */
    @PutMapping("/{orderId}/reject")
    public OrderResponse rejectOrder(
            @PathVariable Long orderId
    ) {
        return orderService.rejectOrder(orderId);
    }
}
