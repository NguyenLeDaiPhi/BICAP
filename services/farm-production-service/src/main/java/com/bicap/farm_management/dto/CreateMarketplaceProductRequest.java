package com.bicap.farm_management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateMarketplaceProductRequest {
    
    // Farm ID - nullable để backend tự lấy farm mặc định
    private Long farmId;

    // Link to the validated Export Batch - MADE NULLABLE để farm manager có thể thêm sản phẩm trực tiếp
    private Long exportBatchId;
    
    @NotBlank
    private String name;
    
    private String description;
    
    @NotNull
    @Positive
    private BigDecimal price;

    @NotNull
    private Integer quantity;

    @NotBlank
    private String unit;

    @NotBlank
    private String category;

    private String imageUrl;
}