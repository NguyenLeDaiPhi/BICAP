package com.bicap.trading_order_service;
import com.bicap.trading_order_service.entity.*;
import com.bicap.trading_order_service.exception.repository.*;
import com.bicap.trading_order_service.service.TradingOrderEventListener;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
class ProductSyncTests {
    @Test void usesOwnerAndSourceIdInsteadOfAmbiguousFarmLookupAndKeepsApproval() {
        var managers = mock(FarmManagerRepository.class);
        var products = mock(MarketplaceProductRepository.class);
        var listener = new TradingOrderEventListener();
        ReflectionTestUtils.setField(listener, "farmManagerRepository", managers);
        ReflectionTestUtils.setField(listener, "productRepository", products);
        FarmManager manager = new FarmManager(); manager.setId(4L); manager.setFarmId(1L);
        when(managers.findById(4L)).thenReturn(Optional.of(manager));
        when(products.findBySourceProductId(2L)).thenReturn(Optional.empty());
        Map<String,Object> message = new HashMap<>(Map.of("ownerId",4L,"farmId",1L,"sourceProductId",2L,"productionBatchId",1L,"name","Rice","price",15000,"quantity",1000,"unit","kg","imageUrl","http://localhost:8000/api/v1/images/download/photo.png"));
        listener.receiveProductData(message);
        var captor = org.mockito.ArgumentCaptor.forClass(MarketplaceProduct.class);
        verify(products).save(captor.capture());
        var product = captor.getValue();
        assertSame(manager,product.getFarmManager()); assertEquals(2L,product.getSourceProductId());
        assertEquals(1L,product.getProductionBatchId()); assertEquals("PENDING",product.getStatus());
        verify(managers,never()).findByFarmId(anyLong());
        product.setStatus("APPROVED");
        when(products.findBySourceProductId(2L)).thenReturn(Optional.of(product));
        listener.receiveProductData(message);
        assertEquals("APPROVED",product.getStatus());
        verify(products,times(2)).save(product);
        verify(products,never()).findFirstByFarmManager_FarmIdAndNameIgnoreCaseAndStatusOrderByCreatedAtDesc(anyLong(),anyString(),anyString());
    }
    @Test void productsWithoutPhotoNeverReachAdminProjection() {
        var products = mock(MarketplaceProductRepository.class); var managers = mock(FarmManagerRepository.class);
        var listener = new TradingOrderEventListener();
        ReflectionTestUtils.setField(listener,"productRepository",products); ReflectionTestUtils.setField(listener,"farmManagerRepository",managers);
        listener.receiveProductData(Map.of("ownerId",4L,"farmId",1L));
        listener.receiveProductData(Map.of("ownerId",4L,"farmId",1L,"imageUrl"," "));
        verifyNoInteractions(products,managers);
    }
    @Test void synchronizationFailureIsNotSilentlyAcknowledged() {
        var managers = mock(FarmManagerRepository.class); var products = mock(MarketplaceProductRepository.class);
        var listener = new TradingOrderEventListener();
        ReflectionTestUtils.setField(listener,"farmManagerRepository",managers);
        ReflectionTestUtils.setField(listener,"productRepository",products);
        when(managers.findById(4L)).thenReturn(Optional.empty());
        assertThrows(IllegalStateException.class,()->listener.receiveProductData(Map.of("ownerId",4L,"farmId",1L,"imageUrl","photo.png")));
        verifyNoInteractions(products);
    }
}
