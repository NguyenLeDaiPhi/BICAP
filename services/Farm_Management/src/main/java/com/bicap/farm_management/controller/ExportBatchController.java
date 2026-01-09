package com.bicap.farm_management.controller;

import com.bicap.farm_management.entity.ExportBatch;
import com.bicap.farm_management.service.ExportBatchService;
import jakarta.servlet.http.HttpServletRequest; // Import request
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity; // Import ResponseEntity
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export-batches")
@CrossOrigin(origins = "*")
public class ExportBatchController {
    @Autowired
    private ExportBatchService exportService;

    @PostMapping("/from-production/{batchId}")
    public ResponseEntity<?> createExport(
            @PathVariable Long batchId, 
            @RequestBody ExportBatch exportBatch,
            HttpServletRequest request // Inject request
    ) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User ID not found in token");
            }

            // Gọi service kèm userId
            ExportBatch created = exportService.createExportBatch(batchId, exportBatch, userId);
            return ResponseEntity.ok(created);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // API xem ảnh QR (Giữ nguyên, không cần bảo vệ chặt vì QR thường công khai)
    @GetMapping(value = "/qr/{batchId}", produces = MediaType.IMAGE_PNG_VALUE)
    public byte[] getQrImage(@PathVariable Long batchId) throws Exception {
        return com.bicap.farm_management.util.QRCodeGenerator.generateQRCodeImage("Batch ID: " + batchId, 250, 250);
    }
}