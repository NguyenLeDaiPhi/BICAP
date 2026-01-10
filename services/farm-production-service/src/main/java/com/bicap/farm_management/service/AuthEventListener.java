package com.bicap.farm_management.service;

import com.bicap.farm_management.entity.Farm;
import com.bicap.farm_management.repository.FarmRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthEventListener {

    @Autowired
    private FarmRepository farmRepository;

    @RabbitListener(queues = "${bicap.farm.auth.queue:bicap.farm.auth.queue}")
    public void receiveAuthMessage(Map<String, Object> message) {
        System.out.println("📩 [FARM] Received Auth Message: " + message);

        try {
            // Extract data safely
            Long userId = ((Number) message.get("id")).longValue();
            String username = (String) message.get("username");
            String address = (String) message.get("address");

            // Check if farm already exists for this user to avoid duplicates
            if (farmRepository.findById(userId).isPresent()) {
                System.out.println("⚠️ Farm already exists for user: " + username);
                return;
            }

            // Create a default Farm for the new Farm Manager
            Farm farm = new Farm();
            farm.setOwnerId(userId);
            farm.setFarmName(username + "'s Farm"); // Default name using username
            farm.setAddress(address); // Default address
            
            farmRepository.save(farm);
            
            System.out.println("✅ [FARM] Created default farm for user: " + username);

        } catch (Exception e) {
            System.err.println("❌ Error processing auth message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
