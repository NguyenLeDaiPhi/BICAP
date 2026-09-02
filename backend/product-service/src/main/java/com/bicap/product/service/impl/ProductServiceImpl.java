package com.bicap.product.service.impl;

import com.bicap.product.dto.CreateProductRequest;
import com.bicap.product.dto.ProductResponse;
import com.bicap.product.entity.Product;
import com.bicap.product.exception.ResourceNotFoundException;
import com.bicap.product.repository.ProductRepository;
import com.bicap.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        log.info("Creating product: {}", request.getName());
        
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .categoryId(request.getCategoryId())
                .farmId(request.getFarmId())
                .origin(request.getOrigin())
                .unit(request.getUnit())
                .price(request.getPrice())
                .minOrderQuantity(request.getMinOrderQuantity())
                .imageUrl(request.getImageUrl())
                .certification(request.getCertification())
                .status(Product.ProductStatus.ACTIVE)
                .build();

        Product saved = productRepository.save(product);
        log.info("Product created with id: {}", saved.getId());
        
        return ProductResponse.fromEntity(saved);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        log.info("Getting product by id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", id));
        return ProductResponse.fromEntity(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        log.info("Getting all products");
        return productRepository.findAll().stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getProductsByFarmId(Long farmId) {
        log.info("Getting products by farmId: {}", farmId);
        return productRepository.findByFarmIdAndStatus(farmId, Product.ProductStatus.ACTIVE).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getProductsByCategoryId(Long categoryId) {
        log.info("Getting products by categoryId: {}", categoryId);
        return productRepository.findByCategoryId(categoryId).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, CreateProductRequest request) {
        log.info("Updating product id: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", id));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategoryId(request.getCategoryId());
        product.setOrigin(request.getOrigin());
        product.setUnit(request.getUnit());
        product.setPrice(request.getPrice());
        product.setMinOrderQuantity(request.getMinOrderQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setCertification(request.getCertification());

        Product updated = productRepository.save(product);
        log.info("Product updated: {}", id);
        
        return ProductResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deleting product id: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", id));
        
        product.setStatus(Product.ProductStatus.INACTIVE);
        productRepository.save(product);
        
        log.info("Product soft deleted: {}", id);
    }
}
