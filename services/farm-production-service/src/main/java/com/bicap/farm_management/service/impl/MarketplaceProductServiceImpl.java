package com.bicap.farm_management.service.impl;

import org.springframework.stereotype.Service;

import com.bicap.farm_management.dto.CreateMarketplaceProductRequest;
import com.bicap.farm_management.dto.ProductResponse;
import com.bicap.farm_management.dto.UpdateMarketplaceProductRequest;
import com.bicap.farm_management.entity.MarketplaceProduct;
import com.bicap.farm_management.repository.MarketplaceProductRepository;
import com.bicap.farm_management.service.IMarketplaceProductService;
import com.bicap.farm_management.service.exception.ProductNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceProductServiceImpl implements IMarketplaceProductService {

    private final MarketplaceProductRepository repository;

    public MarketplaceProductServiceImpl(MarketplaceProductRepository repository) {
        this.repository = repository;
    }

    @Override
    public MarketplaceProduct createProduct(CreateMarketplaceProductRequest request) {
        MarketplaceProduct product = new MarketplaceProduct();
        product.setBatchId(request.getBatchId());
        product.setFarmId(request.getFarmId());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setQuantity(request.getQuantity());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());
        product.setStatus("PENDING");
        product.setCreatedAt(LocalDateTime.now());
        return repository.save(product);
    }

    @Override
    public List<ProductResponse> getApprovedProducts() {
        return repository.findAll().stream()
            .filter(p -> "APPROVED".equals(p.getStatus()))
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    public ProductResponse getProductDetail(Long productId) {
        MarketplaceProduct product = repository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> getProductsByFarm(Long farmId) {
        return repository.findAll().stream()
            .filter(p -> p.getFarmId().equals(farmId))
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getPendingProducts() {
        return repository.findAll().stream()
            .filter(p -> "PENDING".equals(p.getStatus()))
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    public MarketplaceProduct updateProduct(Long productId, UpdateMarketplaceProductRequest request) {
        MarketplaceProduct product = repository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
        
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setQuantity(request.getQuantity());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());
        
        return repository.save(product);
    }

    @Override
    public MarketplaceProduct approveProduct(Long productId) {
        MarketplaceProduct product = repository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
        product.setStatus("APPROVED");
        return repository.save(product);
    }

    @Override
    public void deleteProduct(Long productId) {
        MarketplaceProduct product = repository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
        repository.delete(product);
    }

    private ProductResponse mapToResponse(MarketplaceProduct product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setBatchId(product.getBatchId());
        response.setFarmId(product.getFarmId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setUnit(product.getUnit());
        response.setQuantity(product.getQuantity());
        response.setCategory(product.getCategory());
        response.setImageUrl(product.getImageUrl());
        response.setStatus(product.getStatus());
        response.setCreatedAt(product.getCreatedAt());
        return response;
    }
}