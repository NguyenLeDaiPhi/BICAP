package com.bicap.trading_order_service.service;

import com.bicap.trading_order_service.dto.CreateMarketplaceProductRequest;
import com.bicap.trading_order_service.dto.ProductResponse;
import com.bicap.trading_order_service.entity.MarketplaceProduct;

import java.util.List;

public interface IMarketplaceProductService {

    // FARM – đăng sản phẩm
    MarketplaceProduct createProduct(CreateMarketplaceProductRequest request);

    // RETAILER – xem danh sách sản phẩm APPROVED
    List<ProductResponse> getApprovedProducts();

    // RETAILER – xem chi tiết + giá bán hiện tại
    ProductResponse getProductDetail(Long productId);
}
