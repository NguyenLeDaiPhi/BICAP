package com.bicap.farm_management.service;

import com.bicap.farm_management.repository.MarketplaceProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductStatusListener {
    private final MarketplaceProductRepository repository;

    @Transactional
    @RabbitListener(queues = "bicap.farm.product.status.queue")
    public void receiveStatus(Map<String, Object> message) {
        if (!(message.get("sourceProductId") instanceof Number id)) return;
        String status = String.valueOf(message.get("status"));
        if (!"APPROVED".equals(status) && !"REJECTED".equals(status)) return;
        var product = repository.findById(id.longValue())
            .orElseThrow(() -> new IllegalStateException("Product awaiting review not found: " + id));
        product.setStatus(status);
        repository.save(product);
    }
}
