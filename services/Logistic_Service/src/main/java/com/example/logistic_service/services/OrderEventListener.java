package com.example.logistic_service.services;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class OrderEventListener {

    @Autowired
    private LogisticsService logisticsService;

    // Hàm này sẽ tự động chạy khi có tin nhắn từ Redis
    public void receiveMessage(String message) {
        System.out.println(">>> [REDIS RECEIVED] Có đơn hàng mới: " + message);

        try {
            // Giả sử tin nhắn đến dạng JSON:
            // {"orderId": 123, "farmId": 10, "retailerId": 20, "pickup": "Kho A", "delivery": "Shop B"}

            ObjectMapper mapper = new ObjectMapper();
            JsonNode json = mapper.readTree(message);

            Long orderId = json.get("orderId").asLong();
            Long farmId = json.get("farmId").asLong();
            Long retailerId = json.get("retailerId").asLong();
            String pickupAddr = json.get("pickup").asText();
            String deliveryAddr = json.get("delivery").asText();

            // Gọi hàm tạo chuyến hàng trong LogisticsService
            logisticsService.createShipment(orderId, farmId, retailerId, pickupAddr, deliveryAddr);

            System.out.println(">>> [SUCCESS] Đã tạo chuyến hàng tự động cho đơn #" + orderId);

        } catch (Exception e) {
            System.err.println("!!! Lỗi xử lý tin nhắn Redis: " + e.getMessage());
        }
    }
}
