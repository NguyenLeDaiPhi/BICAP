package com.example.farm_management.controller;

import com.example.farm_management.dto.FarmUpdateDto;
import com.example.farm_management.entity.*;
import com.example.farm_management.repository.ExportBatchRepository;
import com.example.farm_management.service.FarmFeatureService;
import com.example.farm_management.utils.QRCodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farm-features")
public class FarmFeatureController {

    @Autowired
    private FarmFeatureService featureService;
    @Autowired
    private ExportBatchRepository exportBatchRepository;
    // 1. Cập nhật thông tin trang trại
    @PutMapping("/{farmId}/info")
    public ResponseEntity<Farm> updateInfo(@PathVariable Long farmId, @RequestBody FarmUpdateDto dto) {
        return ResponseEntity.ok(featureService.updateFarmInfo(farmId, dto));
    }

    // 2. Tạo QR Code cho lô xuất hàng
    @PostMapping("/export-batches/{exportId}/generate-qr")
    public ResponseEntity<ExportBatch> generateQr(@PathVariable Long exportId) {
        return ResponseEntity.ok(featureService.generateQrCode(exportId));
    }

    @GetMapping(value = "/export-batches/{exportId}/qr-image", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQrImage(@PathVariable Long exportId) {
        // 1. Lấy thông tin lô hàng từ DB
        ExportBatch exportBatch = exportBatchRepository.findById(exportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lô hàng"));

        // 2. Lấy nội dung cần mã hóa (đã lưu ở bước generate-qr trước đó)
        // Nếu chưa có thì lấy tạm BatchCode
        String qrContent = exportBatch.getQrCodeUrl();
        if (qrContent == null || qrContent.isEmpty()) {
            qrContent = exportBatch.getBatchCode();
        }

        // 3. Tạo ảnh QR (Kích thước 300x300)
        byte[] image = QRCodeGenerator.getQRCodeImage(qrContent, 300, 300);

        // 4. Trả về ảnh
        return ResponseEntity.ok().body(image);
    }

}