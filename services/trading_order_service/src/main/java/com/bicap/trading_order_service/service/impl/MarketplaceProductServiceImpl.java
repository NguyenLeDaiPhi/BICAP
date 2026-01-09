package com.bicap.trading_order_service.service.impl;

import com.bicap.trading_order_service.dto.CreateMarketplaceProductRequest;
import com.bicap.trading_order_service.dto.ProductResponse;
import com.bicap.trading_order_service.entity.MarketplaceProduct;
import com.bicap.trading_order_service.exception.ProductNotFoundException;
import com.bicap.trading_order_service.repository.MarketplaceProductRepository;
import com.bicap.trading_order_service.service.IMarketplaceProductService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceProductServiceImpl
        implements IMarketplaceProductService {

    private final MarketplaceProductRepository repository;

    public MarketplaceProductServiceImpl(
            MarketplaceProductRepository repository) {
        this.repository = repository;
    }

    /* =====================================================
       1️⃣ FARM – ĐĂNG SẢN PHẨM LÊN SÀN (MỤC 1)
       ===================================================== */
    @Override
    public MarketplaceProduct createProduct(
            CreateMarketplaceProductRequest request) {

        MarketplaceProduct product = new MarketplaceProduct();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setFarmId(request.getFarmId());
        product.setBatchId(request.getBatchId());

        // Trạng thái mặc định khi Farm đăng
        product.setStatus("PENDING");

        return repository.save(product);
    }

    /* =====================================================
       2️⃣ RETAILER – XEM DANH SÁCH SẢN PHẨM ĐÃ DUYỆT (MỤC 2)
       ===================================================== */
    @Override
    public List<ProductResponse> getApprovedProducts() {
        return repository.findByStatus("APPROVED")
                .stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());
    }

    /* =====================================================
       3️⃣ RETAILER – XEM CHI TIẾT + GIÁ BÁN HIỆN TẠI (MỤC 2)
       ===================================================== */
    @Override
    public ProductResponse getProductDetail(Long productId) {

        MarketplaceProduct product = repository
                .findByIdAndStatus(productId, "APPROVED")
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found or not approved"));

        return toProductResponse(product);
    }

    /* =====================================================
       HÀM CHUYỂN ENTITY → DTO (INTERNAL)
       ===================================================== */
    private ProductResponse toProductResponse(
            MarketplaceProduct product) {

        ProductResponse dto = new ProductResponse();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());   // GIÁ HIỆN TẠI
        dto.setFarmId(product.getFarmId());
        dto.setBatchId(product.getBatchId());
        return dto;
    }
}
