package com.bicap.farm_management.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;

import com.bicap.farm_management.dto.CreateMarketplaceProductRequest;
import com.bicap.farm_management.dto.ProductResponse;
import com.bicap.farm_management.dto.UpdateMarketplaceProductRequest;
import com.bicap.farm_management.entity.ExportBatch;
import com.bicap.farm_management.entity.Farm;
import com.bicap.farm_management.entity.MarketplaceProduct;
import com.bicap.farm_management.entity.ProductionBatch;
import com.bicap.farm_management.repository.ProductionBatchRepository;
import com.bicap.farm_management.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.bicap.farm_management.repository.ExportBatchRepository;
import com.bicap.farm_management.repository.FarmRepository;
import com.bicap.farm_management.repository.MarketplaceProductRepository;
import com.bicap.farm_management.service.IMarketplaceProductService;
import com.bicap.farm_management.service.ProductProducerMQ;
import com.bicap.farm_management.service.exception.ProductNotFoundException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MarketplaceProductServiceImpl implements IMarketplaceProductService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MarketplaceProductServiceImpl.class);

    private final MarketplaceProductRepository repository;

    private final FarmRepository farmRepository;

    private final ProductProducerMQ productProducerMQ;

    private final ExportBatchRepository exportBatchRepository;
    private final ProductionBatchRepository batchRepository;
    private final SecurityUtils securityUtils;

    
    public MarketplaceProductServiceImpl(MarketplaceProductRepository repository, FarmRepository farmRepository, ProductProducerMQ productProducerMQ, ExportBatchRepository exportBatchRepository, ProductionBatchRepository batchRepository, SecurityUtils securityUtils) {
        this.repository = repository;
        this.farmRepository = farmRepository;
        this.productProducerMQ = productProducerMQ;
        this.exportBatchRepository = exportBatchRepository;
        this.batchRepository = batchRepository;
        this.securityUtils = securityUtils;
    }

    @Override
    @Transactional
    public MarketplaceProduct createProduct(CreateMarketplaceProductRequest request) {
        LOGGER.info("Creating product for Farm ID: {}", request.getFarmId());
        
        // Lấy farm - ưu tiên farmId từ request, nếu không có thì lấy farm mặc định
        Farm farm;
        if (!securityUtils.isAdmin()) {
            farm = securityUtils.getCurrentUserFarmOrThrow();
            if (request.getFarmId() != null && !request.getFarmId().equals(farm.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chỉ được thêm sản phẩm cho trang trại của mình.");
            }
        } else if (request.getFarmId() != null) {
            farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new RuntimeException("Farm not found with ID: " + request.getFarmId()));
        } else {
            // Lấy farm đầu tiên làm mặc định
            farm = farmRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No farm found in system"));
        }

        // Lấy exportBatch nếu có - MADE NULLABLE để cho phép thêm sản phẩm trực tiếp
        ExportBatch exportBatch = null;
        if (request.getExportBatchId() != null) {
            exportBatch = exportBatchRepository.findById(request.getExportBatchId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lô xuất hàng."));
            if (!exportBatch.getProductionBatch().getFarm().getId().equals(farm.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Lô xuất hàng không thuộc trang trại của bạn.");
            }
        }

        ProductionBatch productionBatch = exportBatch != null ? exportBatch.getProductionBatch() : null;
        if (request.getProductionBatchId() != null) {
            ProductionBatch selectedBatch = batchRepository.findById(request.getProductionBatchId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy mùa vụ."));
            if (!selectedBatch.getFarm().getId().equals(farm.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Mùa vụ không thuộc trang trại của bạn.");
            }
            if (productionBatch != null && !productionBatch.getId().equals(selectedBatch.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lô xuất hàng và mùa vụ không khớp nhau.");
            }
            productionBatch = selectedBatch;
        }
        
        if (productionBatch != null && repository.existsByProductionBatch_Id(productionBatch.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mùa vụ này đã có sản phẩm. Vui lòng xem sản phẩm đã tạo.");
        }

        // Create new product saved to it owns database
        MarketplaceProduct product = new MarketplaceProduct();
        product.setExportBatch(exportBatch);
        product.setProductionBatch(productionBatch);
        product.setFarm(farm);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setQuantity(request.getQuantity());
        product.setCategory(request.getCategory());
        product.setImageUrl(null);
        product.setStatus("DRAFT");
        product.setCreatedAt(LocalDateTime.now());

        // Store first (so we can safely reference exportBatch + other fields)
        MarketplaceProduct saved;
        try {
            saved = repository.saveAndFlush(product);
        } catch (DataIntegrityViolationException exception) {
            if (productionBatch != null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Mùa vụ này đã có sản phẩm. Vui lòng xem sản phẩm đã tạo.", exception);
            }
            throw exception;
        }

        return saved;
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
        return repository.findByFarmId(farmId).stream()
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
    @Transactional
    public MarketplaceProduct updateProduct(Long productId, UpdateMarketplaceProductRequest request) {
        MarketplaceProduct product = repository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
        requireOwnership(product);
        
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setQuantity(request.getQuantity());
        product.setCategory(request.getCategory());

        MarketplaceProduct saved = repository.save(product);

        if (!"DRAFT".equals(saved.getStatus()) && saved.getImageUrl() != null && !saved.getImageUrl().isBlank()) {
            broadcastProduct(saved, "UPDATED_PRODUCT");
        }

        return saved;
    }

    @Override
    public MarketplaceProduct approveProduct(Long productId) {
        MarketplaceProduct product = repository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
        product.setStatus("APPROVED");
        return repository.save(product);
    }

    @Override
    public MarketplaceProduct getProductById(Long productId) {
        return repository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
    }

    @Override
    public void deleteProduct(Long productId) {
        MarketplaceProduct product = repository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
        repository.delete(product);
    }

    private void broadcastProduct(MarketplaceProduct saved, String eventType) {
        // Send message to the trading order service
        Map<String, Object> dataProduct = new HashMap<>();
        dataProduct.put("sourceProductId", saved.getId());
        dataProduct.put("ownerId", saved.getFarm().getOwnerId());
        dataProduct.put("productionBatchId", saved.getProductionBatch() != null ? saved.getProductionBatch().getId() : null);
        dataProduct.put("farmId", saved.getFarm().getId());
        dataProduct.put("farmName", saved.getFarm().getFarmName());
        dataProduct.put("name", saved.getName());
        dataProduct.put("description", saved.getDescription());
        dataProduct.put("unit", saved.getUnit());
        dataProduct.put("price", saved.getPrice());
        dataProduct.put("quantity", saved.getQuantity());
        dataProduct.put("category", saved.getCategory());
        dataProduct.put("imageUrl", saved.getImageUrl());
        // Correlation key for upsert on trading side
        dataProduct.put("batchId", saved.getExportBatch() != null ? saved.getExportBatch().getBatchCode() : null);

        LOGGER.info("Sending message to trading-order-service for product: {}", saved.getName());
        productProducerMQ.sendMessageToTradingOrderService(eventType, dataProduct);

    }

    private void requireOwnership(MarketplaceProduct product) {
        if (!securityUtils.isAdmin() && !product.getFarm().getId().equals(securityUtils.getCurrentFarmId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chỉ được sửa sản phẩm của trang trại mình.");
        }
    }

    @Override
    @Transactional
    public MarketplaceProduct attachProductImage(Long productId, String imageUrl) {
        MarketplaceProduct product = getProductById(productId);
        requireOwnership(product);
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần tải ảnh sản phẩm trước khi gửi duyệt.");
        }
        boolean draft = "DRAFT".equals(product.getStatus());
        product.setImageUrl(imageUrl);
        if (draft) product.setStatus("PENDING");
        MarketplaceProduct saved = repository.saveAndFlush(product);
        broadcastProduct(saved, draft ? "CREATED_PRODUCT" : "UPDATED_PRODUCT");
        return saved;
    }

    private ProductResponse mapToResponse(MarketplaceProduct product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setFarmId(product.getFarm().getId());
        response.setFarmName(product.getFarm().getFarmName());
        ProductionBatch batch = product.getProductionBatch();
        if (batch == null && product.getExportBatch() != null) batch = product.getExportBatch().getProductionBatch();
        response.setBatchId(batch != null ? batch.getId() : null);
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
