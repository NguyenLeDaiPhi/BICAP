package com.bicap.trading_order_service.controller;

import com.bicap.trading_order_service.dto.DashboardStatsDTO;
import com.bicap.trading_order_service.service.IDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/stats")
@Tag(name = "Admin Dashboard Statistics", description = "APIs thống kê Dashboard dành cho Admin")
public class AdminDashboardController {

    private final IDashboardService dashboardService;

    public AdminDashboardController(IDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/v1/admin/stats/overview - Lấy thống kê tổng quan
     * Trả về: tổng sản phẩm ACTIVE, tổng đơn hàng trong ngày, doanh thu
     */
    @GetMapping("/overview")
    @Operation(summary = "Thống kê tổng quan Dashboard",
               description = "Trả về tổng số sản phẩm ACTIVE, tổng số đơn hàng trong ngày, doanh thu ước tính")
    public ResponseEntity<DashboardStatsDTO> getOverviewStats() {
        DashboardStatsDTO stats = dashboardService.getOverviewStats();
        return ResponseEntity.ok(stats);
    }
}
