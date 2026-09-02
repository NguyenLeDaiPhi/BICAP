package com.bicap.product.dto;

import com.bicap.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Long categoryId;
    private Long farmId;
    private String origin;
    private String unit;
    private BigDecimal price;
    private BigDecimal minOrderQuantity;
    private String imageUrl;
    private String certification;
    private Product.ProductStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductResponse fromEntity(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategoryId())
                .farmId(product.getFarmId())
                .origin(product.getOrigin())
                .unit(product.getUnit())
                .price(product.getPrice())
                .minOrderQuantity(product.getMinOrderQuantity())
                .imageUrl(product.getImageUrl())
                .certification(product.getCertification())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
