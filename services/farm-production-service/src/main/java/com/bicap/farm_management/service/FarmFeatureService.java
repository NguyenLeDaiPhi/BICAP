package com.bicap.farm_management.service;

import com.bicap.farm_management.dto.FarmCreateDto;
import com.bicap.farm_management.dto.FarmUpdateDto;
import com.bicap.farm_management.entity.*;
import com.bicap.farm_management.repository.*;
import com.zaxxer.hikari.util.ClockSource;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class FarmFeatureService {

    @Autowired private FarmRepository farmRepository;

    // Method create mới
    @Transactional
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
        String email = dto.getEmail() != null ? dto.getEmail().trim() : null;
        String hotline = dto.getHotline() != null ? dto.getHotline().trim() : null;
        Double areaSize = dto.getAreaSize();
        String description = dto.getDescription() != null ? dto.getDescription().trim() : null;
        Farm newFarm = new Farm();
        newFarm.setFarmName(farmName);
        newFarm.setAddress(address);
        newFarm.setEmail(email);
        newFarm.setHotline(hotline);
        newFarm.setAreaSize(areaSize);
        newFarm.setDescription(description);
        if (dto.getCreateAt() != null && !dto.getCreateAt().trim().isEmpty()) 
            {
                newFarm.setCreatedAt(LocalDateTime.parse(dto.getCreateAt().trim()));
            }
            else {
                newFarm.setCreatedAt(LocalDateTime.now()); 
            }

        return farmRepository.save(newFarm);
    }
    // 1. CẬP NHẬT THÔNG TIN TRANG TRẠI
    @Transactional
    public Farm updateFarmInfo(Long farmId, FarmUpdateDto dto) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        if(dto.getFarmName() != null) farm.setFarmName(dto.getFarmName());
        if(dto.getAddress() != null) farm.setAddress(dto.getAddress());
        if(dto.getEmail() != null) farm.setEmail(dto.getEmail());
        if(dto.getHotline() != null) farm.setHotline(dto.getHotline());
        if(dto.getAreaSize() != null) farm.setAreaSize(dto.getAreaSize());
        if(dto.getDescription() != null) farm.setDescription(dto.getDescription());
        if(dto.getOwnerId() != null) farm.setOwnerId(dto.getOwnerId());
        return farmRepository.save(farm);
    }
    public Farm getFarmById(Long id) {
        return farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trang trại với ID: " + id));
    }
    public Farm getFarmByOwnerId(Long ownerId) {
    return farmRepository.findByOwnerId(ownerId)
            .orElseThrow(() -> new RuntimeException("Chưa tìm thấy trang trại nào cho tài khoản này."));
    }
}