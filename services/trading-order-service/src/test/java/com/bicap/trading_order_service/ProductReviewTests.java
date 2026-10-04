package com.bicap.trading_order_service;
import com.bicap.trading_order_service.controller.InternalAdminProductController;
import com.bicap.trading_order_service.entity.MarketplaceProduct;
import com.bicap.trading_order_service.exception.repository.MarketplaceProductRepository;
import com.bicap.trading_order_service.service.IProductService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class ProductReviewTests {
    @Test void adminCannotApproveProductWithoutPhoto() {
        var repository = mock(MarketplaceProductRepository.class); var product = new MarketplaceProduct(); product.setStatus("PENDING");
        when(repository.findById(1L)).thenReturn(Optional.of(product));
        var controller = new InternalAdminProductController(repository, mock(IProductService.class));
        assertEquals(409, assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> controller.approveProduct(1L)).getStatusCode().value());
        verify(repository, never()).save(any());
    }
    @Test void approvesTradingProductAndNotifiesFarmUsingOriginalId() {
        var repository=mock(MarketplaceProductRepository.class);
        var service=mock(IProductService.class);
        var rabbit=mock(RabbitTemplate.class);
        var controller=new InternalAdminProductController(repository,service);
        ReflectionTestUtils.setField(controller,"rabbitTemplate",rabbit);
        ReflectionTestUtils.setField(controller,"productExchange","bicap.product.exchange");
        var product=new MarketplaceProduct(); product.setId(1L); product.setSourceProductId(2L); product.setStatus("PENDING"); product.setImageUrl("photo.png");
        when(repository.findById(1L)).thenReturn(Optional.of(product));
        assertEquals(200,controller.approveProduct(1L).getStatusCode().value());
        assertEquals("APPROVED",product.getStatus()); verify(repository).save(product);
        verify(rabbit).convertAndSend("bicap.product.exchange","product.status.routing_key",Map.of("sourceProductId",2L,"status","APPROVED"));
    }
}
