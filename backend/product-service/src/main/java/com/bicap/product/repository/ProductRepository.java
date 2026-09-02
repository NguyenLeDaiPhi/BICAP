package com.bicap.product.repository;

import com.bicap.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByFarmId(Long farmId);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByStatus(Product.ProductStatus status);
    List<Product> findByFarmIdAndStatus(Long farmId, Product.ProductStatus status);
}
