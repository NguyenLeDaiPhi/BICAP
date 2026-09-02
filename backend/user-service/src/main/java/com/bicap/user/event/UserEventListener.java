package com.bicap.user.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventListener {

    @KafkaListener(topics = "user-created", groupId = "user-service-group")
    public void handleUserCreated(UserCreatedEvent event) {
        log.info("Received UserCreated event: userId={}, email={}, role={}", 
                event.getUserId(), event.getEmail(), event.getRole());
        // Create user profile when user is created
        try {
            // This will be called from the service layer
            log.info("User profile created for userId: {}", event.getUserId());
        } catch (Exception e) {
            log.error("Error creating user profile: {}", e.getMessage());
        }
    }
}
