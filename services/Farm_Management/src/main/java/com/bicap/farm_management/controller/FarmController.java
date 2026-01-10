package com.bicap.farm_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bicap.farm_management.entity.Farm;
import com.bicap.farm_management.service.FarmService;

import java.util.List;

@RestController
@RequestMapping("/api/farms")
@CrossOrigin(origins = "*") // Cho phép trang web gọi API thoải mái
public class FarmController {
    @Autowired
    private FarmService farmService;

    @PostMapping
    public Farm createFarm(@RequestBody Farm farm) {
        return farmService.createFarm(farm);
    }

    @GetMapping
    public List<Farm> getAllFarms() {
        return farmService.getAllFarms();
    }
}