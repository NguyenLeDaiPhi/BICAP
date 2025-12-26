package com.example.farm_management.service;

import com.example.farm_management.dto.FarmCreateDto;
import com.example.farm_management.dto.FarmUpdateDto;
import com.example.farm_management.entity.*;
import com.example.farm_management.repository.*;
import com.zaxxer.hikari.util.ClockSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class FarmFeatureService {

    @Autowired private FarmRepository farmRepository;
    @Autowired private ExportBatchRepository exportBatchRepository;
    @Autowired private ProductionBatchRepository productionBatchRepository;

    // Method create mới
    public Farm createFarm(FarmCreateDto dto) {
        // Kiểm tra thủ công các trường bắt buộc
        if (dto.getFarmName() == null || dto.getFarmName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên trang trại là bắt buộc");
        }
        if (dto.getAddress() == null || dto.getAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Địa chỉ là bắt buộc");
        }

        // Optional: có thể trim dữ liệu để sạch hơn
        String farmName = dto.getFarmName().trim();
        String address = dto.getAddress().trim();
        String businessLicense = dto.getBusinessLicense() != null ? dto.getBusinessLicense().trim() : null;

        Farm newFarm = new Farm();
        newFarm.setFarmName(farmName);
        newFarm.setAddress(address);
        newFarm.setBusinessLicense(businessLicense);

        // Nếu sau này tích hợp auth, set ownerId ở đây
        newFarm.setOwnerId(currentId);

        return farmRepository.save(newFarm);
    }
    // 1. CẬP NHẬT THÔNG TIN PHÁP LÝ TRANG TRẠI
    public Farm updateFarmInfo(Long farmId, FarmUpdateDto dto) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        if(dto.getFarmName() != null) farm.setFarmName(dto.getFarmName());
        if(dto.getAddress() != null) farm.setAddress(dto.getAddress());
        if(dto.getBusinessLicense() != null) farm.setBusinessLicense(dto.getBusinessLicense());

        return farmRepository.save(farm);
    }

    // 2. TẠO MÃ QR CHO ĐỢT XUẤT HÀNG
    public ExportBatch generateQrCode(Long exportBatchId) {
        ExportBatch exportBatch = exportBatchRepository.findById(exportBatchId)
                .orElseThrow(() -> new RuntimeException("Export Batch not found"));

        // Logic tạo nội dung QR: Thường là 1 đường link dẫn đến trang truy xuất
        // Ví dụ: https://bicap.com/trace/{batchCode}
        String traceabilityUrl = "https://bicap.vn/trace/" + exportBatch.getBatchCode();

        // Lưu URL này vào DB. Ở Frontend sẽ dùng thư viện (vd: qrcode.react) để biến URL này thành hình ảnh.
        exportBatch.setQrCodeUrl(traceabilityUrl);

        // Giả lập lưu Hash lên Blockchain tại bước này (nếu cần)
        exportBatch.setTxHash("0x" + UUID.randomUUID().toString());

        return exportBatchRepository.save(exportBatch);
    }

}