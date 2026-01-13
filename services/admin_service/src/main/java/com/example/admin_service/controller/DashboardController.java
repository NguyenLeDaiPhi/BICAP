package com.example.admin_service.controller;

import com.example.admin_service.client.FarmServiceClient;
import com.example.admin_service.enums.ERole;
import com.example.admin_service.repository.UserRepository;
import jakarta.persistence.criteria.Join;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
    @RestController
    @RequestMapping("/api/v1/admin/dashboard")
    public class DashboardController {

        @Autowired
        private UserRepository userRepository; // Lấy số User
        @Autowired
        private FarmServiceClient farmServiceClient; // Lấy số Farm

        @GetMapping("/stats")
        public ResponseEntity<Map<String, Object>> getDashboardStats() {
            Map<String, Object> stats = new HashMap<>();

            // 1. Thống kê User (Query trực tiếp DB Admin)
            long totalUsers = userRepository.count();
            long totalManagers = userRepository.count((root, query, cb) -> {
                Join<Object, Object> roles = root.join("roles");
                return cb.equal(roles.get("name"), ERole.ROLE_FARMMANAGER);
            });

            // 2. Thống kê Farm (Gọi qua Feign)
            Long totalFarms = farmServiceClient.countTotalFarms();

            stats.put("totalUsers", totalUsers);
            stats.put("totalFarmManagers", totalManagers);
            stats.put("totalFarms", totalFarms);

            return ResponseEntity.ok(stats);
        }
    }

