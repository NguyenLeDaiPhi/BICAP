package com.example.admin_service.client;

import com.example.admin_service.dto.OrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "trading-order-service", contextId = "tradingOrderServiceClient", url = "${trading-order.service.url:http://localhost:8082}")
public interface TradingOrderServiceClient {

    /**
     * Lấy danh sách đơn hàng theo trạng thái
     */
    @GetMapping("/api/admin/orders")
    List<OrderResponse> getOrdersByStatus(@RequestParam(required = false) String status);

    /**
     * Lấy chi tiết đơn hàng theo ID
     */
    @GetMapping("/api/admin/orders/{id}")
    OrderResponse getOrderById(@PathVariable("id") Long id);
}
