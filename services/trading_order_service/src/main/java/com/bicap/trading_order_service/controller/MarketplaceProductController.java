package com.bicap.trading_order_service.controller;

import com.bicap.trading_order_service.dto.CreateMarketplaceProductRequest;
import com.bicap.trading_order_service.dto.ProductResponse;
import com.bicap.trading_order_service.entity.MarketplaceProduct;
import com.bicap.trading_order_service.service.IMarketplaceProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace-products")
public class MarketplaceProductController {

    private final IMarketplaceProductService service;

    public MarketplaceProductController(IMarketplaceProductService service) {
        this.service = service;
    }

    // FARM
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MarketplaceProduct createProduct(
            @Valid @RequestBody CreateMarketplaceProductRequest request) {
        return service.createProduct(request);
    }

    // RETAILER – danh sách sản phẩm
    @GetMapping
    public List<ProductResponse> getApprovedProducts() {
        return service.getApprovedProducts();
    }

    // RETAILER – chi tiết + giá
    @GetMapping("/{id}")
    public ProductResponse getProductDetail(@PathVariable Long id) {
        return service.getProductDetail(id);
    }
}
