package com.bicap.farm_management.controller;

import com.bicap.farm_management.dto.FarmUpdateDto;
import com.bicap.farm_management.entity.*;
import com.bicap.farm_management.repository.FarmRepository;
import com.bicap.farm_management.service.FarmFeatureService;
import com.bicap.farm_management.dto.FarmLogDTO;
import com.bicap.farm_management.service.FarmLogService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.bicap.farm_management.dto.FarmCreateDto; // Import DTO mới

@RestController
@RequestMapping("/api/farm-features")
public class FarmFeatureController {

    @Autowired
    private FarmFeatureService farmFeatureService;
    @Autowired
    private FarmRepository farmRepository;
    @Autowired
    private FarmLogService farmLogService;

    @PostMapping("/")
    public ResponseEntity<Farm> createFarm(@RequestBody FarmCreateDto dto) {
        Farm createdFarm = farmFeatureService.createFarm(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFarm);
    }
    // 1. Cập nhật thông tin trang trại
    @PutMapping("/{farmId}/info")
    public ResponseEntity<Farm> updateInfo(@PathVariable Long farmId, @RequestBody FarmUpdateDto dto) {
        return ResponseEntity.ok(farmFeatureService.updateFarmInfo(farmId, dto));
    }
    // 2. Lấy thông tin chi tiết trang trại
    @GetMapping("/{farmId}")
    public ResponseEntity<Farm> getFarmDetail(@PathVariable Long farmId) {
        return ResponseEntity.ok(farmFeatureService.getFarmById(farmId));
    }
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<Farm> getFarmByOwnerId(@PathVariable Long ownerId) {
        return ResponseEntity.ok(farmFeatureService.getFarmByOwnerId(ownerId));
    }
    @GetMapping // Map vào GET /api/farm-features
    public ResponseEntity<List<Farm>> getAllFarms() {
        // Lưu ý: Bạn cần chắc chắn trong FarmFeatureService đã viết hàm getAllFarms()
        return ResponseEntity.ok(farmFeatureService.getAllFarms());
    }
    //API: đếm tổng số nông trại
    @GetMapping("/count")
    public ResponseEntity<Long> countFarms() {
        return ResponseEntity.ok(farmRepository.count());
    }
    // API MỚI: Lấy nhật ký tổng hợp
    @GetMapping("/{farmId}/logs")
    public ResponseEntity<List<FarmLogDTO>> getFarmLogs(@PathVariable Long farmId) {
        return ResponseEntity.ok(farmLogService.getIntegratedLogs(farmId));
    }
}