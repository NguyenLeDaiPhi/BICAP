package com.bicap.shipping_manager_service.service;

import com.bicap.shipping_manager_service.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShipmentProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendShipmentStatusUpdate(Long orderId, String status) {
        Map<String, Object> message = new HashMap<>();
        message.put("orderId", orderId);
        message.put("status", status);
        message.put("timestamp", System.currentTimeMillis());

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, message);
        System.out.println("Sent shipment update for Order ID: " + orderId + " Status: " + status);
    }
}