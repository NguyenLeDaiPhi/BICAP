package com.bicap.farm_management.service;

import com.bicap.farm_management.dto.CreateMarketplaceProductRequest;
import com.bicap.farm_management.entity.*;
import com.bicap.farm_management.repository.*;
import com.bicap.farm_management.service.impl.MarketplaceProductServiceImpl;
import com.bicap.farm_management.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class MarketplaceProductCreationTests {
    private final MarketplaceProductRepository products = mock(MarketplaceProductRepository.class);
    private final FarmRepository farms = mock(FarmRepository.class);
    private final ProductProducerMQ producer = mock(ProductProducerMQ.class);
    private final ExportBatchRepository exports = mock(ExportBatchRepository.class);
    private final ProductionBatchRepository batches = mock(ProductionBatchRepository.class);
    private final SecurityUtils security = mock(SecurityUtils.class);
    private final MarketplaceProductServiceImpl service = new MarketplaceProductServiceImpl(
        products, farms, producer, exports, batches, security);
    private Farm ownFarm;

    @BeforeEach
    void setup() {
        ownFarm = new Farm(); ownFarm.setId(42L); ownFarm.setOwnerId(4L);
        ownFarm.setFarmName("Trang trại của tôi");
        when(security.getCurrentUserFarmOrThrow()).thenReturn(ownFarm);
        when(security.getCurrentFarmId()).thenReturn(42L);
    }

    private CreateMarketplaceProductRequest request() {
        CreateMarketplaceProductRequest request = new CreateMarketplaceProductRequest();
        request.setName("Lúa ST25"); request.setCategory("Lúa gạo");
        request.setPrice(BigDecimal.valueOf(15000)); request.setQuantity(10); request.setUnit("kg");
        return request;
    }

    @Test
    void createsDraftWithoutPublishingEvenIfClientProvidesImageUrl() {
        ProductionBatch batch = new ProductionBatch(); batch.setId(7L); batch.setFarm(ownFarm);
        when(batches.findById(7L)).thenReturn(Optional.of(batch));
        when(products.saveAndFlush(any())).thenAnswer(call -> { MarketplaceProduct p = call.getArgument(0); p.setId(9L); return p; });
        CreateMarketplaceProductRequest request = request(); request.setProductionBatchId(7L); request.setImageUrl("https://untrusted.example/fake.jpg");
        MarketplaceProduct result = service.createProduct(request);
        assertSame(ownFarm, result.getFarm()); assertSame(batch, result.getProductionBatch());
        assertNull(result.getExportBatch()); assertEquals("DRAFT", result.getStatus()); assertNull(result.getImageUrl());
        verifyNoInteractions(producer);
        verify(farms, never()).findAll();
    }

    @Test
    void uploadingImagePromotesDraftAndPublishesPhotoUsingSameSeasonProduct() {
        var product = new MarketplaceProduct(); product.setId(9L); product.setFarm(ownFarm); product.setStatus("DRAFT");
        when(products.findById(9L)).thenReturn(Optional.of(product));
        when(products.saveAndFlush(any())).thenAnswer(call -> call.getArgument(0));
        var saved = service.attachProductImage(9L, "http://localhost:8000/api/v1/images/download/photo.png");
        assertEquals("PENDING", saved.getStatus());
        verify(producer).sendMessageToTradingOrderService(eq("CREATED_PRODUCT"), argThat(data -> data instanceof java.util.Map<?,?> map && saved.getImageUrl().equals(map.get("imageUrl")) && Long.valueOf(9L).equals(map.get("sourceProductId"))));
    }

    @Test
    void textEditPreservesPhotoAndCannotBypassDraftSubmission() {
        var product = new MarketplaceProduct(); product.setId(9L); product.setFarm(ownFarm); product.setStatus("DRAFT");
        when(products.findById(9L)).thenReturn(Optional.of(product)); when(products.save(any())).thenAnswer(call -> call.getArgument(0));
        var update = new com.bicap.farm_management.dto.UpdateMarketplaceProductRequest(); update.setImageUrl("https://untrusted.example/fake.jpg");
        service.updateProduct(9L, update); assertNull(product.getImageUrl()); verifyNoInteractions(producer);
        product.setStatus("PENDING"); product.setImageUrl("photo.png");
        service.updateProduct(9L, update); assertEquals("photo.png", product.getImageUrl());
        verify(producer).sendMessageToTradingOrderService(eq("UPDATED_PRODUCT"), anyMap());
    }

    @Test
    void cannotAttachPhotoToAnotherFarmProduct() {
        var other = new Farm(); other.setId(99L);
        var product = new MarketplaceProduct(); product.setFarm(other);
        when(products.findById(9L)).thenReturn(Optional.of(product));
        assertEquals(403, assertThrows(ResponseStatusException.class, () -> service.attachProductImage(9L, "photo.png")).getStatusCode().value());
        verify(products, never()).saveAndFlush(any()); verifyNoInteractions(producer);
    }

    @Test
    void rejectsSeasonFromAnotherFarmBeforeSaving() {
        Farm otherFarm = new Farm(); otherFarm.setId(99L);
        ProductionBatch batch = new ProductionBatch(); batch.setId(8L); batch.setFarm(otherFarm);
        when(batches.findById(8L)).thenReturn(Optional.of(batch));
        CreateMarketplaceProductRequest request = request(); request.setProductionBatchId(8L);
        assertEquals(403, assertThrows(ResponseStatusException.class, () -> service.createProduct(request)).getStatusCode().value());
        verify(products, never()).saveAndFlush(any()); verifyNoInteractions(producer);
    }

    @Test
    void rejectsExplicitFarmThatUserDoesNotOwn() {
        CreateMarketplaceProductRequest request = request(); request.setFarmId(99L);
        assertEquals(403, assertThrows(ResponseStatusException.class, () -> service.createProduct(request)).getStatusCode().value());
        verify(products, never()).saveAndFlush(any());
    }

    @Test
    void rejectsSecondProductForSeasonBeforePublishing() {
        ProductionBatch batch = new ProductionBatch(); batch.setId(7L); batch.setFarm(ownFarm);
        when(batches.findById(7L)).thenReturn(Optional.of(batch));
        when(products.existsByProductionBatch_Id(7L)).thenReturn(true);
        CreateMarketplaceProductRequest request = request(); request.setProductionBatchId(7L);
        assertEquals(409, assertThrows(ResponseStatusException.class, () -> service.createProduct(request)).getStatusCode().value());
        verify(products, never()).saveAndFlush(any()); verifyNoInteractions(producer);
    }

    @Test
    void rejectsConcurrentDuplicateWhenDatabaseUniqueConstraintWins() {
        ProductionBatch batch = new ProductionBatch(); batch.setId(7L); batch.setFarm(ownFarm);
        when(batches.findById(7L)).thenReturn(Optional.of(batch));
        when(products.saveAndFlush(any())).thenThrow(new org.springframework.dao.DataIntegrityViolationException("Duplicate season"));
        CreateMarketplaceProductRequest request = request(); request.setProductionBatchId(7L);
        assertEquals(409, assertThrows(ResponseStatusException.class, () -> service.createProduct(request)).getStatusCode().value());
        verifyNoInteractions(producer);
    }
}
