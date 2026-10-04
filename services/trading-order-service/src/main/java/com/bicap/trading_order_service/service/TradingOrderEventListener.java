package com.bicap.trading_order_service.service;

import com.bicap.trading_order_service.entity.FarmManager;
import com.bicap.trading_order_service.entity.MarketplaceProduct;
import com.bicap.trading_order_service.exception.repository.FarmManagerRepository;
import com.bicap.trading_order_service.exception.repository.MarketplaceProductRepository;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class TradingOrderEventListener {

    @Autowired
    private FarmManagerRepository farmManagerRepository;

    @Autowired
    private MarketplaceProductRepository productRepository;

    // 1. Listen for User Data from Auth Service
    @RabbitListener(queues = "${bicap.auth.response.queue}")
    public void receiveUserData(Map<String, Object> message) {
        System.out.println("📩 [TRADING] Received User Data: " + message);
        try {
            Long id = ((Number) message.get("id")).longValue();
            String username = (String) message.get("username");
            String email = (String) message.get("email");

            // Check if user exists to avoid duplicates
            FarmManager user = farmManagerRepository.findById(id).orElse(new FarmManager());
            
            user.setId(id);
            // Auth user IDs and farm IDs are separate. Keep the farm mapping from farm events.
            user.setUsername(username);
            user.setEmail(email);
            
            if (user.getRole() == null) user.setRole("ROLE_FARMMANAGER");

            farmManagerRepository.save(user);
            System.out.println("✅ [TRADING] Saved User: " + username);
        } catch (Exception e) {
            System.err.println("❌ Error saving user: " + e.getMessage());
        }
    }

    // 2. Listen for Product Data from Farm Production Service
    @RabbitListener(queues = "${bicap.farm.product.queue}")
    public void receiveProductData(Map<String, Object> message) {
        System.out.println("📩 [TRADING] Received Product Data: " + message);
        if (!(message.get("imageUrl") instanceof String image) || image.isBlank()) return;
        try {
            // Extract data from the map sent by MarketplaceProductServiceImpl
            Object farmIdObj = message.get("farmId");
            if (!(farmIdObj instanceof Number)) throw new IllegalAccessException("Missing farmId");
            Long farmId = ((Number) farmIdObj).longValue();

            Long ownerId = message.get("ownerId") instanceof Number ? ((Number) message.get("ownerId")).longValue() : null;
            FarmManager farmManager = (ownerId != null ? farmManagerRepository.findById(ownerId) : farmManagerRepository.findByFarmId(farmId))
                .orElseThrow(() -> new IllegalStateException("Farm manager projection is missing"));
            if (!farmId.equals(farmManager.getFarmId())) {
                farmManager.setFarmId(farmId);
                farmManagerRepository.save(farmManager);
            }
            Long sourceProductId = message.get("sourceProductId") instanceof Number ? ((Number) message.get("sourceProductId")).longValue() : null;

            String productName = (String) message.get("name");
            String description = (String) message.get("description");
            String unit = (String) message.get("unit");
            Double price = ((Number) message.get("price")).doubleValue();
            Integer quantity = ((Number) message.get("quantity")).intValue();
            String category = (String) message.get("category");
            String imageUrl = (String) message.get("imageUrl");
            String batchId = message.get("batchId") != null ? String.valueOf(message.get("batchId")) : null;

            // Upsert by batchId (image is often uploaded after product creation)
            MarketplaceProduct product = sourceProductId != null ? productRepository.findBySourceProductId(sourceProductId).orElse(null) : null;
            if (product == null && batchId != null && !batchId.isBlank()) {
                product = productRepository.findFirstByBatchId(batchId).orElse(null);
            }
            // Backward-compat: older records may have null batchId; try match by farm + name + PENDING
            if (product == null && sourceProductId == null && productName != null) {
                MarketplaceProduct candidate = productRepository
                        .findFirstByFarmManager_FarmIdAndNameIgnoreCaseAndStatusOrderByCreatedAtDesc(farmId, productName, "PENDING")
                        .orElse(null);
                if (candidate != null && (candidate.getBatchId() == null || candidate.getBatchId().isBlank())) {
                    product = candidate;
                }
            }

            if (product == null) {
                product = new MarketplaceProduct();
                product.setFarmManager(farmManager);
                product.setStatus("PENDING"); // Default status on trading floor
                product.setCreatedAt(LocalDateTime.now());
            }

            if ("DRAFT".equals(product.getStatus())) product.setStatus("PENDING");

            // Update fields (do not reset status on updates)
            product.setName(productName);
            product.setDescription(description);
            product.setUnit(unit);
            product.setPrice(price != null ? price.doubleValue() : null);
            product.setQuantity(quantity != null ? quantity.intValue() : null);
            product.setCategory(category);
            product.setImageUrl(imageUrl);
            product.setBatchId(batchId);
            product.setSourceProductId(sourceProductId);
            product.setProductionBatchId(message.get("productionBatchId") instanceof Number ? ((Number) message.get("productionBatchId")).longValue() : null);

            productRepository.save(product);
            System.out.println("✅ [TRADING] Upserted Product: " + productName + " | batchId=" + batchId);
        } catch (Exception e) {
            System.err.println("❌ Error saving product: " + e.getMessage());
            throw new IllegalStateException("Product synchronization failed", e);
        }
    }

    // 3. Listen for Farm Creation from Farm Production Service
    // This updates FarmManager.farmId so that products can be linked correctly
    @RabbitListener(queues = "${bicap.farm.creation.queue}")
    public void receiveFarmCreationData(Map<String, Object> message) {
        System.out.println("📩 [TRADING] Received Farm Creation Data: " + message);
        try {
            Long farmId = ((Number) message.get("farmId")).longValue();
            Long ownerId = ((Number) message.get("ownerId")).longValue();

            // Find the FarmManager by ownerId (user ID) and update the farmId
            FarmManager farmManager = farmManagerRepository.findById(ownerId).orElse(null);
            if (farmManager != null) {
                farmManager.setFarmId(farmId);
                farmManagerRepository.save(farmManager);
                System.out.println("✅ [TRADING] Updated FarmManager.farmId = " + farmId + " for ownerId = " + ownerId);
            } else {
                System.out.println("⚠️ [TRADING] FarmManager not found for ownerId = " + ownerId);
            }
        } catch (Exception e) {
            System.err.println("❌ Error processing farm creation: " + e.getMessage());
        }
    }
}
