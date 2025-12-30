package com.bicap.farm_management.controller;

import com.bicap.farm_management.entity.EnvironmentMetric;
import com.bicap.farm_management.service.EnvironmentMetricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/environment-metrics")
@CrossOrigin(origins = "*")
public class EnvironmentMetricController {
    
    @Autowired
    private EnvironmentMetricService metricService;

    // API: Ghi nhận chỉ số môi trường (VD: Nhiệt độ, Độ ẩm)
    // POST /api/environment-metrics/batch/{batchId}
    @PostMapping("/batch/{batchId}")
    public EnvironmentMetric addMetric(@PathVariable Long batchId, @RequestBody EnvironmentMetric metric) {
        return metricService.addMetric(batchId, metric);
    }

    // API: Xem lịch sử môi trường của 1 lô
    // GET /api/environment-metrics/batch/{batchId}
    @GetMapping("/batch/{batchId}")
    public List<EnvironmentMetric> getMetricsByBatch(@PathVariable Long batchId) {
        return metricService.getMetricsByBatch(batchId);
    }
}