package com.bicap.product.service;

import com.bicap.product.dto.CreateProductRequest;
import com.bicap.product.dto.ProductResponse;

import java.util.List;

public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse getProductById(Long id);
    List<ProductResponse> getAllProducts();
    List<ProductResponse> getProductsByFarmId(Long farmId);
    List<ProductResponse> getProductsByCategoryId(Long categoryId);
    ProductResponse updateProduct(Long id, CreateProductRequest request);
    void deleteProduct(Long id);
}
