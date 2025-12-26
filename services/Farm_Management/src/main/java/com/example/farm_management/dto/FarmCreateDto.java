package com.example.farm_management.dto;

import lombok.Data;

@Data
public class FarmCreateDto {
    private String farmName;
    private String address;
    private String businessLicense;
    // Có thể thêm các trường khác sau này
}