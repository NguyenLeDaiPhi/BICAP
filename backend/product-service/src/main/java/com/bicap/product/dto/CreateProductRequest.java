package com.bicap.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateProductRequest {
    
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 200, message = "Tên sản phẩm không được vượt quá 200 ký tự")
    private String name;

    @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
    private String description;

    @NotNull(message = "ID danh mục không được để trống")
    private Long categoryId;

    @NotNull(message = "ID trang trại không được để trống")
    private Long farmId;

    @Size(max = 100, message = "Xuất xứ không được vượt quá 100 ký tự")
    private String origin;

    @Size(max = 50, message = "Đơn vị không được vượt quá 50 ký tự")
    private String unit;

    @DecimalMin(value = "0.0", message = "Giá phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @DecimalMin(value = "0.0", message = "Số lượng đặt tối thiểu phải lớn hơn hoặc bằng 0")
    private BigDecimal minOrderQuantity;

    @Size(max = 500, message = "URL hình ảnh không được vượt quá 500 ký tự")
    private String imageUrl;

    @Size(max = 200, message = "Chứng nhận không được vượt quá 200 ký tự")
    private String certification;
}
