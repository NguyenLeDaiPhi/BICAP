package com.bicap.traceability.controller;

import com.bicap.traceability.dto.ApiResponse;
import com.bicap.traceability.dto.TraceabilityResponse;
import com.bicap.traceability.service.TraceabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trace")
@RequiredArgsConstructor
@Tag(name = "Truy xuất nguồn gốc", description = "Truy xuất nguồn gốc nông sản")
public class TraceabilityController {

    private final TraceabilityService traceabilityService;

    @GetMapping("/{traceCode}")
    @Operation(summary = "Truy xuất nguồn gốc", description = "Lấy thông tin truy xuất nguồn gốc theo mã truy xuất")
    public ResponseEntity<ApiResponse<TraceabilityResponse>> getTraceability(@PathVariable String traceCode) {
        TraceabilityResponse response = traceabilityService.getTraceabilityByCode(traceCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
