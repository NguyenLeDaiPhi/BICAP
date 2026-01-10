package com.bicap.farm_management.controller;

import com.bicap.farm_management.entity.ProductionBatch;
import com.bicap.farm_management.service.ProductionBatchService;
import jakarta.servlet.http.HttpServletRequest; // Import thêm cái này
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity; // Dùng ResponseEntity
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production-batches")
@CrossOrigin(origins = "*")
public class ProductionBatchController {

    @Autowired
    private ProductionBatchService batchService;

    // 1. API Tạo Lô sản xuất
    @PostMapping("/farm/{farmId}")
    public ResponseEntity<?> createBatch(
            @PathVariable Long farmId, 
            @RequestBody ProductionBatch batch,
            HttpServletRequest request // Inject request
    ) {
        try {
            // Lấy userId từ attribute (do Filter set vào)
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User ID not found in token");
            }

            // Gọi service với userId
            ProductionBatch createdBatch = batchService.createBatch(farmId, batch, userId);
            return ResponseEntity.ok(createdBatch);
            
        } catch (Exception e) {
            // Trả về lỗi 400 nếu vi phạm quyền sở hữu hoặc lỗi logic
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/farm/{farmId}")
    public List<ProductionBatch> getBatchesByFarm(@PathVariable Long farmId) {
        return batchService.getBatchesByFarm(farmId);
    }
}