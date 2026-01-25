package com.bicap.farm_management.controller;

import com.bicap.farm_management.dto.CreateMarketplaceProductRequest;
import com.bicap.farm_management.dto.ProductResponse;
import com.bicap.farm_management.entity.MarketplaceProduct;
import com.bicap.farm_management.service.IMarketplaceProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/marketplace-products")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class MarketplaceProductController {

    private final IMarketplaceProductService service;

    public MarketplaceProductController(IMarketplaceProductService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MarketplaceProduct createProduct(@Valid @RequestBody CreateMarketplaceProductRequest request) {
        return service.createProduct(request);
    }

    @GetMapping("/farm/{farmId}")
    public List<ProductResponse> getProductsByFarm(@PathVariable Long farmId) {
        return service.getProductsByFarm(farmId);
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
}
