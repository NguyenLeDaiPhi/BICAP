package com.bicap.shipping_manager_service.client;

import com.bicap.shipping_manager_service.dto.OrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "trading-order-service", url = "${application.config.trading-order-service-url}")
public interface FarmServiceClient {
    @GetMapping("/api/admin/orders/{orderId}")
    OrderResponse getOrderDetails(@PathVariable("orderId") Long orderId);
}