package com.bicap.farm_management.controller;

import com.bicap.farm_management.entity.ExportBatch;
import com.bicap.farm_management.service.ExportBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export-batches")
@CrossOrigin(origins = "*")
public class ExportBatchController {
    @Autowired
    private ExportBatchService exportService;

    @PostMapping("/from-production/{batchId}")
    public ResponseEntity<ExportBatch> createExport(@PathVariable Long batchId, @RequestBody ExportBatch exportBatch) {
        ExportBatch created = exportService.createExportBatch(batchId, exportBatch);
        return ResponseEntity.ok(created);
    }
    
    // API để test xem ảnh QR Code trực tiếp (Nếu muốn)
    @GetMapping(value = "/qr/{batchId}", produces = MediaType.IMAGE_PNG_VALUE)
    public byte[] getQrImage(@PathVariable Long batchId) throws Exception {
        // Đây chỉ là demo tạo ảnh động để test
        return com.bicap.farm_management.util.QRCodeGenerator.generateQRCodeImage("Batch ID: " + batchId, 250, 250);
    }
}
