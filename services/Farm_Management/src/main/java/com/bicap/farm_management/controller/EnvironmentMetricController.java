package com.bicap.farm_management.controller;

import com.bicap.farm_management.entity.EnvironmentMetric;
import com.bicap.farm_management.service.EnvironmentMetricService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/environment-metrics")
@CrossOrigin(origins = "*")
public class EnvironmentMetricController {
    
    @Autowired
    private EnvironmentMetricService metricService;

    // 1. Thêm chỉ số thủ công
    @PostMapping("/batch/{batchId}")
    public ResponseEntity<?> addMetric(
            @PathVariable Long batchId, 
            @RequestBody EnvironmentMetric metric,
            HttpServletRequest request
    ) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User ID not found");

            EnvironmentMetric saved = metricService.addMetric(batchId, metric, userId);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/batch/{batchId}")
    public List<EnvironmentMetric> getMetricsByBatch(@PathVariable Long batchId) {
        return metricService.getMetricsByBatch(batchId);
    }

    // 2. Đồng bộ thời tiết
    @PostMapping("/sync-weather/{batchId}")
    public ResponseEntity<?> syncWeather(
            @PathVariable Long batchId,
            HttpServletRequest request
    ) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User ID not found");

            List<EnvironmentMetric> result = metricService.syncWeatherFromApi(batchId, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}