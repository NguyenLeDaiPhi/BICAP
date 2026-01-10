package com.bicap.farm_management.controller;

import com.bicap.farm_management.entity.FarmingProcess;
import com.bicap.farm_management.service.FarmingProcessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/farming-processes")
@CrossOrigin(origins = "*")
public class FarmingProcessController {
    @Autowired
    private FarmingProcessService processService;

    @PostMapping("/batch/{batchId}")
    public FarmingProcess addProcess(@PathVariable Long batchId, @RequestBody FarmingProcess process) {
        return processService.addProcess(batchId, process);
    }

    @GetMapping("/batch/{batchId}")
    public List<FarmingProcess> getHistory(@PathVariable Long batchId) {
        return processService.getProcessesByBatch(batchId);
    }
}