package com.bicap.farm_management.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bicap.farm_management.dto.CreateMarketplaceProductRequest;
import com.bicap.farm_management.dto.ProductResponse;
import com.bicap.farm_management.dto.UpdateMarketplaceProductRequest;
import com.bicap.farm_management.entity.MarketplaceProduct;
import com.bicap.farm_management.service.IMarketplaceProductService;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace-products")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MarketplaceProductController {

    private final IMarketplaceProductService service;

    public MarketplaceProductController(IMarketplaceProductService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MarketplaceProduct createProduct(
            @Valid @RequestBody CreateMarketplaceProductRequest request) {
        return service.createProduct(request);
    }

    @GetMapping
    public List<ProductResponse> getApprovedProducts() {
        return service.getApprovedProducts();
    }

    @GetMapping("/{id}")
    public ProductResponse getProductDetail(@PathVariable Long id) {
        return service.getProductDetail(id);
    }

    @GetMapping("/farm/{farmId}")
    public List<ProductResponse> getProductsByFarm(@PathVariable Long farmId) {
        return service.getProductsByFarm(farmId);
    }

    @GetMapping("/pending/list")
    public List<ProductResponse> getPendingProducts() {
        return service.getPendingProducts();
    }

    @PutMapping("/{id}")
    public MarketplaceProduct updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMarketplaceProductRequest request) {
        return service.updateProduct(id, request);
    }

    @PatchMapping("/{id}/approve")
    public MarketplaceProduct approveProduct(@PathVariable Long id) {
        return service.approveProduct(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
        return ResponseEntity.ok(new ApiResponse("Product deleted successfully"));
    }

    static class ApiResponse {
        private String message;
        public ApiResponse(String message) {
            this.message = message;
        }
        public String getMessage() {
            return message;
        }
    }
}
