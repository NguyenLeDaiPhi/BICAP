package com.bicap.farm_production.controller;

import com.bicap.farm_production.entity.FarmingSeason;
import com.bicap.farm_production.service.FarmingSeasonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seasons")
public class FarmingSeasonController {

    @Autowired
    private FarmingSeasonService service;

    @PostMapping
    public ResponseEntity<FarmingSeason> createSeason(@RequestBody FarmingSeason season) {
        return ResponseEntity.ok(service.createSeason(season));
    }

    @GetMapping
    public ResponseEntity<List<FarmingSeason>> getAllSeasons() {
        return ResponseEntity.ok(service.getAllSeasons());
    }
}
