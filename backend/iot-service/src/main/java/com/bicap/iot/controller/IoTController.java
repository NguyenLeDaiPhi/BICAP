package com.bicap.iot.controller;

import com.bicap.iot.dto.ApiResponse;
import com.bicap.iot.dto.IoTDataRequest;
import com.bicap.iot.dto.IoTDataResponse;
import com.bicap.iot.service.IoTDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
@Tag(name = "IoT", description = "Quản lý dữ liệu IoT")
@SecurityRequirement(name = "bearerAuth")
public class IoTController {

    private final IoTDataService iotDataService;

    @PostMapping("/data")
    @Operation(summary = "Nhận dữ liệu IoT", description = "Nhận dữ liệu từ thiết bị IoT")
    public ResponseEntity<ApiResponse<IoTDataResponse>> receiveData(@Valid @RequestBody IoTDataRequest request) {
        IoTDataResponse response = iotDataService.receiveData(request);
        return ResponseEntity.ok(ApiResponse.success("Dữ liệu IoT đã được nhận", response));
    }

    @GetMapping("/farm/{farmId}")
    @Operation(summary = "Lấy dữ liệu theo trang trại", description = "Trả về danh sách dữ liệu IoT của một trang trại")
    public ResponseEntity<ApiResponse<List<IoTDataResponse>>> getDataByFarm(@PathVariable Long farmId) {
        List<IoTDataResponse> data = iotDataService.getDataByFarm(farmId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/season/{seasonId}")
    @Operation(summary = "Lấy dữ liệu theo mùa vụ", description = "Trả về danh sách dữ liệu IoT của một mùa vụ")
    public ResponseEntity<ApiResponse<List<IoTDataResponse>>> getDataBySeason(@PathVariable Long seasonId) {
        List<IoTDataResponse> data = iotDataService.getDataBySeason(seasonId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/farm/{farmId}/period")
    @Operation(summary = "Lấy dữ liệu theo khoảng thời gian", description = "Trả về dữ liệu IoT trong khoảng thời gian")
    public ResponseEntity<ApiResponse<List<IoTDataResponse>>> getDataByPeriod(
            @PathVariable Long farmId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<IoTDataResponse> data = iotDataService.getDataByFarmAndPeriod(farmId, start, end);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Lấy cảnh báo", description = "Trả về danh sách cảnh báo IoT")
    public ResponseEntity<ApiResponse<List<IoTDataResponse>>> getAlerts() {
        List<IoTDataResponse> alerts = iotDataService.getAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }
}
