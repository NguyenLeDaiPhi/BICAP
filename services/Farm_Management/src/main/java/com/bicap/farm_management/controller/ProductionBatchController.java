package com.bicap.farm_management.controller;

import com.bicap.farm_management.entity.ProductionBatch;
import com.bicap.farm_management.service.ProductionBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production-batches")
@CrossOrigin(origins = "*") // Cho phép gọi từ mọi nơi (Frontend/Postman)
public class ProductionBatchController {

    // 1. API Tạo Lô sản xuất (Sẽ tự động bắn tin nhắn sang Blockchain)
    // Gọi: POST /api/production-batches/farm/{farmId}
    @PostMapping("/farm/{farmId}")
    public ProductionBatch createBatch(@PathVariable Long farmId, @RequestBody ProductionBatch batch) {
        return batchService.createBatch(farmId, batch);
    }

    // 2. API Xem danh sách Lô sản xuất của một Trang trại
    // Gọi: GET /api/production-batches/farm/{farmId}
    @GetMapping("/farm/{farmId}")
    public List<ProductionBatch> getBatchesByFarm(@PathVariable Long farmId) {
        return batchService.getBatchesByFarm(farmId);
    }
}