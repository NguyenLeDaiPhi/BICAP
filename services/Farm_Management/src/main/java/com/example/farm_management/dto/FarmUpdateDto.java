package com.example.farm_management.dto;
import lombok.Data;

@Data
public class FarmUpdateDto {
    private String farmName;
    private String address;
    private String businessLicense;
}