package com.bicap.farm_management.service;

import com.bicap.farm_management.entity.ExportBatch;
import com.bicap.farm_management.entity.ProductionBatch;
import com.bicap.farm_management.repository.ExportBatchRepository;
import com.bicap.farm_management.repository.ProductionBatchRepository;
import com.bicap.farm_management.util.QRCodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class ExportBatchService {
    @Autowired
    private ExportBatchRepository exportRepository;
    @Autowired
    private ProductionBatchRepository batchRepository;

    // SỬA: Thêm tham số userId để check quyền
    public ExportBatch createExportBatch(Long productionBatchId, ExportBatch exportBatch, Long userId) {
        ProductionBatch productionBatch = batchRepository.findById(productionBatchId)
            .orElseThrow(() -> new RuntimeException("Lô sản xuất không tồn tại!"));
        
        // 1. KIỂM TRA QUYỀN SỞ HỮU
        // Logic: Lô sản xuất -> Farm -> OwnerId -> So sánh với userId
        if (!productionBatch.getFarm().getOwnerId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xuất kho lô hàng này (Không thuộc Farm của bạn)!");
        }

        // 2. Cập nhật trạng thái lô sản xuất
        productionBatch.setStatus("EXPORTED");
        batchRepository.save(productionBatch);

        // 3. Thiết lập thông tin xuất kho
        exportBatch.setProductionBatch(productionBatch);
        exportBatch.setExportDate(LocalDateTime.now());

        // 4. Tạo QR Code
        String traceUrl = "https://bicap.vn/trace/" + productionBatch.getBatchCode();
        try {
            byte[] qrImage = QRCodeGenerator.generateQRCodeImage(traceUrl, 250, 250);
            String qrBase64 = Base64.getEncoder().encodeToString(qrImage);
            exportBatch.setQrCodeImage("data:image/png;base64," + qrBase64);
        } catch (Exception e) {
            e.printStackTrace();
            exportBatch.setQrCodeImage("ERROR_GENERATING_QR");
        }

        return exportRepository.save(exportBatch);
    }
}