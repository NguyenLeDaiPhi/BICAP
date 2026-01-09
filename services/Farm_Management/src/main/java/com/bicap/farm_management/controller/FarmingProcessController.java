package com.bicap.farm_management.controller;

import com.bicap.farm_management.entity.FarmingProcess;
import com.bicap.farm_management.service.FarmingProcessService;
import jakarta.servlet.http.HttpServletRequest; // Nhớ import dòng này
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/farming-processes")
@CrossOrigin(origins = "*")
public class FarmingProcessController {
    @Autowired
    private FarmingProcessService processService;

    @PostMapping("/batch/{batchId}")
    public ResponseEntity<?> addProcess(
            @PathVariable Long batchId, 
            @RequestBody FarmingProcess process,
            HttpServletRequest request // Inject request
    ) {
        try {
            // Lấy userId từ token (do Filter xử lý trước đó)
            Long userId = (Long) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User ID not found in token");
            }

            // Gọi service với 3 tham số: batchId, process, userId
            FarmingProcess newProcess = processService.addProcess(batchId, process, userId);
            return ResponseEntity.ok(newProcess);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/batch/{batchId}")
    public List<FarmingProcess> getHistory(@PathVariable Long batchId) {
        return processService.getProcessesByBatch(batchId);
    }
}