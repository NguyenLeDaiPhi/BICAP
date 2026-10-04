package com.bicap.trading_order_service.controller;

import com.bicap.trading_order_service.dto.CreateMarketplaceProductRequest;
import com.bicap.trading_order_service.dto.ProductResponse;
import com.bicap.trading_order_service.entity.MarketplaceProduct;
import com.bicap.trading_order_service.service.IMarketplaceProductService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fetch-marketplace-products")
public class MarketplaceProductController {

    private final IMarketplaceProductService service;

    public MarketplaceProductController(IMarketplaceProductService service) {
        this.service = service;
    }

    /**
     * ✅ TEST JWT – kiểm tra token + role
     */
    @GetMapping("/me")
    public ResponseEntity<?> me() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthenticated");
        }

        return ResponseEntity.ok(
                new JwtTestResponse(
                        authentication.getName(),
                        authentication.getAuthorities()
                                .stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList())
                )
        );
    }

    /**
     * FARM – tạo sản phẩm
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MarketplaceProduct createProduct(
            @Valid @RequestBody CreateMarketplaceProductRequest request
    ) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Vui lòng tạo sản phẩm và thêm ảnh tại giao diện quản lý nông sản của trang trại.");
    }

    /**
     * RETAILER – danh sách sản phẩm đã duyệt (chỉ APPROVED)
     */
    @GetMapping
    public List<ProductResponse> getProducts(
            @RequestParam(value = "name", required = false) String name
    ) {
        if (name != null && !name.trim().isEmpty()) {
            // 🔍 SEARCH – chỉ trả về sản phẩm đã duyệt
            return service.searchApprovedByName(name);
        }
        // 📦 GET ALL – chỉ sản phẩm đã duyệt
        return service.getApprovedProducts();
    }

    /**
     * FARM – Get products by farm ID
     */
    @GetMapping("/farm/{farmId}")
    public List<ProductResponse> getProductsByFarm(@PathVariable Long farmId) {
        return service.getProductsByFarm(farmId);
    }

    /**
     * RETAILER – chi tiết sản phẩm
     */
    @GetMapping("/{id}")
    public ProductResponse getProductDetail(
            @PathVariable Long id
    ) {
        return service.getProductDetail(id);
    }

    /**
     * 🔹 DTO test JWT
     */
    static class JwtTestResponse {
        public String username;
        public List<String> roles;

        public JwtTestResponse(String username, List<String> roles) {
            this.username = username;
            this.roles = roles;
        }
    }
}
