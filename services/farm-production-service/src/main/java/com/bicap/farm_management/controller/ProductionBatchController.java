package com.bicap.farm_management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.bicap.farm_management.dto.CreateProductionBatchRequest;
import com.bicap.farm_management.entity.ProductionBatch;
import com.bicap.farm_management.service.ProductionBatchService;

@RestController
@RequestMapping("/api/production-batches")
@CrossOrigin(origins = "*") // Cho phép gọi từ mọi nơi (Frontend/Postman)
public class ProductionBatchController {

    @Autowired
    private ProductionBatchService batchService;

    // 1. API Lấy danh sách mùa vụ (GET /api/production-batches)
    // Không cần farmId trong URL - lấy theo user đăng nhập hoặc farm mặc định
    @PreAuthorize("hasAnyAuthority('ROLE_FARMMANAGER', 'ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<ProductionBatch>> getAllBatches() {
        List<ProductionBatch> batches = batchService.getAllBatches();
        return ResponseEntity.ok(batches);
    }

    // 2. API Tạo mùa vụ mới (POST /api/production-batches)
    // Không cần farmId trong URL - tự động lấy farm từ user đăng nhập
    @PreAuthorize("hasAuthority('ROLE_FARMMANAGER')")
    @PostMapping
    public ResponseEntity<ProductionBatch> createBatch(@RequestBody CreateProductionBatchRequest request) {
        ProductionBatch created = batchService.createBatchWithoutFarmId(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 3. API Lấy chi tiết mùa vụ (GET /api/production-batches/{id})
    @PreAuthorize("hasAnyAuthority('ROLE_FARMMANAGER', 'ROLE_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ProductionBatch> getBatchById(@PathVariable Long id) {
        ProductionBatch batch = batchService.getBatchById(id);
        return ResponseEntity.ok(batch);
    }

    // 4. API Cập nhật mùa vụ (PUT /api/production-batches/{id})
    @PreAuthorize("hasAuthority('ROLE_FARMMANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductionBatch> updateBatch(
            @PathVariable Long id, 
            @RequestBody CreateProductionBatchRequest request) {
        ProductionBatch updated = batchService.updateBatch(id, request);
        return ResponseEntity.ok(updated);
    }

    // 5. API Xóa mùa vụ (DELETE /api/production-batches/{id})
    @PreAuthorize("hasAuthority('ROLE_FARMMANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable Long id) {
        batchService.deleteBatch(id);
        return ResponseEntity.noContent().build();
    }

    // 6. API Tạo Lô sản xuất theo farm cụ thể (POST /api/production-batches/farm/{farmId})
    @PreAuthorize("hasAuthority('ROLE_FARMMANAGER')")
    @PostMapping("/farm/{farmId}")
    public ResponseEntity<ProductionBatch> createBatchForFarm(
            @PathVariable Long farmId, 
            @RequestBody ProductionBatch batch) {
        ProductionBatch created = batchService.createBatch(farmId, batch);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 7. API Xem danh sách Lô sản xuất của một Trang trại (GET /api/production-batches/farm/{farmId})
    @PreAuthorize("hasAnyAuthority('ROLE_FARMMANAGER', 'ROLE_ADMIN')")
    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<ProductionBatch>> getBatchesByFarm(@PathVariable Long farmId) {
        List<ProductionBatch> batches = batchService.getBatchesByFarm(farmId);
        return ResponseEntity.ok(batches);
    }

    // 8. API Xem chi tiết mùa vụ (Monitor: Info + Process + Export + QR)
    @PreAuthorize("hasAnyAuthority('ROLE_FARMMANAGER', 'ROLE_ADMIN')")
    @GetMapping("/{id}/detail")
    public ResponseEntity<com.bicap.farm_management.dto.SeasonDetailResponse> getSeasonDetail(@PathVariable Long id) {
        com.bicap.farm_management.dto.SeasonDetailResponse detail = batchService.getSeasonDetail(id);
        return ResponseEntity.ok(detail);
    }
}