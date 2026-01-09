package com.bicap.farm_management.controller;

import com.bicap.farm_management.entity.ProductListing;
import com.bicap.farm_management.entity.PurchaseOrder;
import com.bicap.farm_management.service.TradingService;
import jakarta.servlet.http.HttpServletRequest; // Nhớ import cái này
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trading")
@CrossOrigin(origins = "*")
public class TradingController {

    @Autowired
    private TradingService tradingService;

    // 1. Nông dân: Đăng bán lô hàng (POST /api/trading/list/{exportBatchId})
    @PostMapping("/list/{exportBatchId}")
    public ResponseEntity<?> listProduct(
            @PathVariable Long exportBatchId, 
            @RequestBody ProductListing listing,
            HttpServletRequest request
    ) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User ID not found");

            // Truyền userId xuống service
            return ResponseEntity.ok(tradingService.listProductOnFloor(exportBatchId, listing, userId));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Retailer: Xem danh sách đang bán (GET /api/trading/listings)
    @GetMapping("/listings")
    public List<ProductListing> getListings() {
        return tradingService.getActiveListings();
    }

    // 3. Retailer: Đặt mua hàng (POST /api/trading/order/{listingId})
    @PostMapping("/order/{listingId}")
    public ResponseEntity<?> placeOrder(
            @PathVariable Long listingId, 
            @RequestBody PurchaseOrder order,
            HttpServletRequest request
    ) {
        try {
            // Lấy ID của Retailer từ Token
            Long retailerId = (Long) request.getAttribute("userId");
            if (retailerId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User ID not found");

            // Truyền retailerId xuống service
            return ResponseEntity.ok(tradingService.placeOrder(listingId, order, retailerId));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Nông dân: Duyệt đơn hàng (PUT /api/trading/approve-order/{orderId})
    @PutMapping("/approve-order/{orderId}")
    public ResponseEntity<?> approveOrder(@PathVariable Long orderId, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User ID not found");

            return ResponseEntity.ok(tradingService.approveOrder(orderId, userId));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}