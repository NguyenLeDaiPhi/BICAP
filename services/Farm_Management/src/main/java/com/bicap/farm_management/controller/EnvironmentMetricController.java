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

    @PostMapping("/batch/{batchId}")
    public EnvironmentMetric addMetric(@PathVariable Long batchId, @RequestBody EnvironmentMetric metric) {
        return metricService.addMetric(batchId, metric);
    }

    @GetMapping("/batch/{batchId}")
    public List<EnvironmentMetric> getMetricsByBatch(@PathVariable Long batchId) {
        return metricService.getMetricsByBatch(batchId);
    }

    // === SỬA DÒNG NÀY ===
    @PostMapping("/sync-weather/{batchId}")
    public List<EnvironmentMetric> syncWeather(@PathVariable Long batchId) {
        return metricService.syncWeatherFromApi(batchId);
    }
}