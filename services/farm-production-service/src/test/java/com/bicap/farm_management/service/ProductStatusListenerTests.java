package com.bicap.farm_management.service;
import com.bicap.farm_management.entity.MarketplaceProduct;
import com.bicap.farm_management.repository.MarketplaceProductRepository;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class ProductStatusListenerTests {
    @Test void approvalUpdatesTheOriginalFarmProduct() {
        var repository=mock(MarketplaceProductRepository.class);
        var product=new MarketplaceProduct(); product.setId(2L); product.setStatus("PENDING");
        when(repository.findById(2L)).thenReturn(Optional.of(product));
        new ProductStatusListener(repository).receiveStatus(Map.of("sourceProductId",2L,"status","APPROVED"));
        assertEquals("APPROVED",product.getStatus()); verify(repository).save(product);
    }
}
