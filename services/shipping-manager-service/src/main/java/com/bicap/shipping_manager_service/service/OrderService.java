package com.bicap.shipping_manager_service.service;

import com.bicap.shipping_manager_service.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final ShipmentRepository shipmentRepository;
    private final RestTemplate restTemplate;
    
    @Value("${application.config.farm-service-url:http://localhost:8081}")
    private String farmServiceUrl;

    public List<Map<String, Object>> getConfirmedOrders(String userToken) {
        try {
            // Call Farm Service to get all orders
            String url = farmServiceUrl + "/api/orders";
            
            // Prepare headers with JWT token
            HttpHeaders headers = new HttpHeaders();
            if (userToken != null && !userToken.isEmpty()) {
                headers.set("Authorization", "Bearer " + userToken);
            }
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // Try to get orders
            ResponseEntity<Object> response;
            try {
                response = restTemplate.exchange(url, HttpMethod.GET, entity, Object.class);
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                // If 401/403, log and return empty list
                System.err.println("Error calling Farm Service: " + e.getStatusCode() + " - " + e.getMessage());
                if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
                    System.err.println("Farm Service requires authentication with ROLE_FARMMANAGER or ROLE_ADMIN.");
                    System.err.println("Current user may not have the required role.");
                }
                return new ArrayList<>();
            } catch (Exception e) {
                System.err.println("Unexpected error calling Farm Service: " + e.getMessage());
                e.printStackTrace();
                return new ArrayList<>();
            }
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> orders = convertToOrderList(response.getBody());
                
                // Get order IDs that already have shipments
                Set<Long> existingOrderIds = shipmentRepository.findAll().stream()
                    .map(s -> s.getOrderId())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
                
                // Filter confirmed orders and exclude those already have shipments
                return orders.stream()
                    .filter(order -> {
                        Object statusObj = order.get("status");
                        String status = statusObj != null ? statusObj.toString().toUpperCase() : "";
                        Long orderId = getOrderId(order);
                        return status.equals("CONFIRMED") && orderId != null && !existingOrderIds.contains(orderId);
                    })
                    .map(this::normalizeOrderData)
                    .collect(Collectors.toList());
            }
            
            return new ArrayList<>();
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    private Map<String, Object> normalizeOrderData(Map<String, Object> order) {
        Map<String, Object> normalized = new HashMap<>(order);
        
        // Ensure common fields exist
        if (!normalized.containsKey("retailerName")) {
            normalized.put("retailerName", normalized.get("retailer") != null ? 
                ((Map<?, ?>) normalized.get("retailer")).get("name") : "N/A");
        }
        if (!normalized.containsKey("productName")) {
            normalized.put("productName", normalized.get("product") != null ? 
                ((Map<?, ?>) normalized.get("product")).get("name") : "Nông sản");
        }
        
        return normalized;
    }
    
    private List<Map<String, Object>> convertToOrderList(Object body) {
        List<Map<String, Object>> result = new ArrayList<>();
        
        if (body instanceof List) {
            @SuppressWarnings("unchecked")
            List<Object> list = (List<Object>) body;
            for (Object item : list) {
                if (item instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> map = (Map<String, Object>) item;
                    result.add(map);
                }
            }
        } else if (body instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = (Map<String, Object>) body;
            result.add(map);
        }
        
        return result;
    }
    
    private Long getOrderId(Map<String, Object> order) {
        Object id = order.get("id");
        if (id instanceof Number) {
            return ((Number) id).longValue();
        } else if (id != null) {
            try {
                return Long.parseLong(id.toString());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
