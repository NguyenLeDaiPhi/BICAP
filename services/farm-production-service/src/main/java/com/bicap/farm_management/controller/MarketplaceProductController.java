package com.bicap.farm_management.controller;

import com.bicap.farm_management.dto.CreateMarketplaceProductRequest;
import com.bicap.farm_management.dto.ProductResponse;
import com.bicap.farm_management.entity.MarketplaceProduct;
import com.bicap.farm_management.service.IMarketplaceProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
