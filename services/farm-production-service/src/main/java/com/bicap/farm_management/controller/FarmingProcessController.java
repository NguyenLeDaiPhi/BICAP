package com.bicap.farm_management.controller;

import com.bicap.farm_management.entity.FarmingProcess;
import com.bicap.farm_management.service.FarmingProcessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/farming-processes")
@CrossOrigin(origins = "*")
public class FarmingProcessController {
    @Autowired
    private FarmingProcessService processService;

    @PostMapping("/batch/{batchId}")
    public ResponseEntity<?> addProcess(@PathVariable Long batchId, @RequestBody FarmingProcess process, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User ID not found.");
        }
        return ResponseEntity.ok(processService.addProcess(batchId, process, userId));
    }

    @GetMapping("/batch/{batchId}")
    public List<FarmingProcess> getHistory(@PathVariable Long batchId) {
        return processService.getProcessesByBatch(batchId);
    }
}