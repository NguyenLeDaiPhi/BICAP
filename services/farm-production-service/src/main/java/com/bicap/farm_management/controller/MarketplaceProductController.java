package com.bicap.farm_management.controller;

import com.bicap.farm_management.dto.CreateMarketplaceProductRequest;
import com.bicap.farm_management.dto.ProductResponse;
import com.bicap.farm_management.dto.UpdateMarketplaceProductRequest;
import com.bicap.farm_management.entity.MarketplaceProduct;
import com.bicap.farm_management.service.IMarketplaceProductService;
import com.bicap.farm_management.service.ImageStorageService;
import com.bicap.farm_management.service.ProductImageValidator;
import org.springframework.web.server.ResponseStatusException;
import com.bicap.farm_management.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/marketplace-products", "/api/products"})
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@RequiredArgsConstructor
public class MarketplaceProductController {

    private final IMarketplaceProductService service;
    private final ImageStorageService imageStorageService;
    private final SecurityUtils securityUtils;

    /**
     * GET /api/products - Lấy tất cả sản phẩm
     * GET /api/marketplace-products - Lấy tất cả sản phẩm
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = service.getApprovedProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/products/my - Lấy sản phẩm theo farm (sử dụng farm mặc định)
     */
    @GetMapping("/my")
    public ResponseEntity<List<ProductResponse>> getMyProducts() {
        Long farmId = securityUtils.getCurrentFarmId();
        List<ProductResponse> products = farmId != null ? service.getProductsByFarm(farmId) : List.of();
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/products/{id} - Lấy chi tiết sản phẩm
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = service.getProductDetail(id);
        return ResponseEntity.ok(product);
    }

    /**
     * POST /api/products - Tạo sản phẩm mới
     * POST /api/marketplace-products - Tạo sản phẩm mới
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MarketplaceProduct createProduct(@Valid @RequestBody CreateMarketplaceProductRequest request) {
        return service.createProduct(request);
    }

    /**
     * PUT /api/products/{id} - Cập nhật sản phẩm
     * PUT /api/marketplace-products/{id} - Cập nhật sản phẩm
     */
    @PutMapping("/{id}")
    public ResponseEntity<MarketplaceProduct> updateProduct(
            @PathVariable Long id,
            @RequestBody UpdateMarketplaceProductRequest request) {
        MarketplaceProduct updated = service.updateProduct(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/products/{id} - Xóa sản phẩm khỏi database
     * DELETE /api/marketplace-products/{id} - Xóa sản phẩm khỏi database
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/products/farm/{farmId} - Lấy sản phẩm theo farm cụ thể
     */
    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<ProductResponse>> getProductsByFarm(@PathVariable Long farmId) {
        return ResponseEntity.ok(service.getProductsByFarm(farmId));
    }

    /**
     * Upload product image
     */
    @PostMapping("/{productId}/images")
    public ResponseEntity<Map<String, Object>> uploadProductImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        MarketplaceProduct product = service.getProductById(productId);
        if (!securityUtils.isAdmin() && !product.getFarm().getId().equals(securityUtils.getCurrentFarmId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sản phẩm không thuộc trang trại của bạn.");
        }
        ProductImageValidator.validate(file);
        String imageUrl = imageStorageService.uploadImage(file, productId, product.getFarm().getId(), extractAuthToken(request));
        MarketplaceProduct saved = service.attachProductImage(productId, imageUrl);
        return ResponseEntity.ok(Map.of("success", true, "imageUrl", saved.getImageUrl(), "status", saved.getStatus()));
    }

    /**
     * Get product images
     */
    @GetMapping("/{productId}/images")
    public ResponseEntity<List<Map<String, Object>>> getProductImages(@PathVariable Long productId) {
        try {
            List<Map<String, Object>> images = imageStorageService.getProductImages(productId);
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/debug/auth")
    public ResponseEntity<Map<String, Object>> debugAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> info = new HashMap<>();
        
        if (authentication == null) {
            info.put("authenticated", false);
            info.put("message", "No authentication found");
        } else {
            info.put("authenticated", true);
            info.put("username", authentication.getName());
            List<String> authorities = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            info.put("authorities", authorities);
            info.put("authoritiesCount", authorities.size());
            info.put("hasROLE_FARMMANAGER", authorities.contains("ROLE_FARMMANAGER"));
            info.put("hasROLE_ADMIN", authorities.contains("ROLE_ADMIN"));
            info.put("principal", authentication.getPrincipal().getClass().getSimpleName());
            info.put("canAccess", authorities.contains("ROLE_FARMMANAGER") || authorities.contains("ROLE_ADMIN"));
        }
        
        return ResponseEntity.ok(info);
    }

    private String extractAuthToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        // Try to get from cookies
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("auth_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        return null;
    }
}
