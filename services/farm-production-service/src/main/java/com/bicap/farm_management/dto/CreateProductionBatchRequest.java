package com.bicap.farm_management.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * DTO for creating/updating a production batch (mùa vụ)
 * Used by farm-manager-web frontend
 */
@Data
public class CreateProductionBatchRequest {
    
    // Tên mùa vụ (frontend gửi lên)
    private String name;
    
    // Loại sản phẩm (productType)
    private String productType;
    
    // Ngày bắt đầu
    private LocalDate startDate;
    
    // Ngày kết thúc/dự kiến thu hoạch
    private LocalDate endDate;
    
    // Diện tích trồng (đơn vị: ha)
    private Double area;
    
    // Sản lượng dự kiến (đơn vị: tấn)
    private Double quantity;
    
    // Trạng thái: PLANNING, ACTIVE, HARVESTED
    private String status;
    
    // Farm ID (optional - nếu có thì dùng, không thì lấy từ user context)
    private Long farmId;
}
