package com.bicap.trading_order_service;
import com.bicap.trading_order_service.entity.*;
import com.bicap.trading_order_service.dto.*;
import com.bicap.trading_order_service.exception.repository.*;
import com.bicap.trading_order_service.service.*;
import com.bicap.trading_order_service.service.impl.MarketplaceProductServiceImpl;
import com.bicap.trading_order_service.controller.InternalAdminProductController;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;
import org.junit.jupiter.api.Test;
import java.util.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
class PublicMarketplaceTests {
    private MarketplaceProduct product(String status) {var p=new MarketplaceProduct();p.setId(1L);p.setSourceProductId(2L);p.setName("Rice");p.setStatus(status);p.setImageUrl("photo.png");p.setPrice(15000.0);p.setQuantity(10);return p;}
    private CreateOrderRequest request(int quantity) {var item=new OrderItemRequest();item.setProductId(1L);item.setQuantity(quantity);ReflectionTestUtils.setField(item,"unitPrice",BigDecimal.ONE);var r=new CreateOrderRequest();r.setItems(List.of(item));r.setShippingAddress("Ho Chi Minh City");return r;}
    @Test void reviewAutomaticallyMakesProductVisibleToPublicCatalog() {
        var repository=mock(MarketplaceProductRepository.class);var managers=mock(FarmManagerRepository.class);var p=product("PENDING");
        when(repository.findAll()).thenReturn(List.of(p));when(repository.findById(1L)).thenReturn(Optional.of(p));
        var catalog=new MarketplaceProductServiceImpl(repository,managers);
        assertTrue(catalog.getApprovedProducts().isEmpty());
        var controller=new InternalAdminProductController(repository,mock(IProductService.class));
        ReflectionTestUtils.setField(controller,"rabbitTemplate",mock(RabbitTemplate.class));ReflectionTestUtils.setField(controller,"productExchange","bicap.product.exchange");controller.approveProduct(1L);
        assertEquals(1,catalog.getApprovedProducts().size());assertEquals(1L,catalog.getApprovedProducts().get(0).getId());
    }
    @Test void publicCatalogAndSearchNeverExposeUnapprovedOrBannedProducts() {
        var repository=mock(MarketplaceProductRepository.class);var approved=product("APPROVED");var pending=product("PENDING");var banned=product("BANNED");var rejected=product("REJECTED");
        when(repository.findAll()).thenReturn(List.of(approved,pending,banned,rejected));when(repository.findByNameContainingIgnoreCase("Rice")).thenReturn(List.of(approved,pending,banned,rejected));when(repository.findById(1L)).thenReturn(Optional.of(pending));
        var catalog=new MarketplaceProductServiceImpl(repository,mock(FarmManagerRepository.class));assertEquals(1,catalog.getApprovedProducts().size());assertEquals(1,catalog.searchApprovedByName("Rice").size());assertEquals(404,assertThrows(ResponseStatusException.class,()->catalog.getProductDetail(1L)).getStatusCode().value());
    }
    @Test void approvedProductCanBeOrderedAtServerPrice() {
        var products=mock(MarketplaceProductRepository.class);var orders=mock(OrderRepository.class);var rabbit=mock(RabbitTemplate.class);when(products.findById(1L)).thenReturn(Optional.of(product("APPROVED")));when(orders.save(any())).thenAnswer(call->{Order order=call.getArgument(0);ReflectionTestUtils.setField(order,"id",100L);return order;});
        var result=new OrderService(orders,products,rabbit).createOrder(request(2),"buyer@example.com",7L);
        assertEquals(100L,result.getOrderId());assertEquals("CREATED",result.getStatus());assertEquals(0,BigDecimal.valueOf(30000).compareTo(result.getTotalAmount()));
        verify(orders).save(any());
    }
    @Test void pendingProductCannotBePurchasedByGuessingItsId() {
        var products=mock(MarketplaceProductRepository.class);var orders=mock(OrderRepository.class);var rabbit=mock(RabbitTemplate.class);when(products.findById(1L)).thenReturn(Optional.of(product("PENDING")));
        assertEquals(409,assertThrows(ResponseStatusException.class,()->new OrderService(orders,products,rabbit).createOrder(request(1),"buyer@example.com",7L)).getStatusCode().value());verifyNoInteractions(orders,rabbit);
    }
    @Test void oversizedOrZeroQuantityCannotCreateOrder() {
        var products=mock(MarketplaceProductRepository.class);var orders=mock(OrderRepository.class);var rabbit=mock(RabbitTemplate.class);when(products.findById(1L)).thenReturn(Optional.of(product("APPROVED")));var service=new OrderService(orders,products,rabbit);
        assertEquals(409,assertThrows(ResponseStatusException.class,()->service.createOrder(request(11),"buyer@example.com",7L)).getStatusCode().value());assertEquals(400,assertThrows(ResponseStatusException.class,()->service.createOrder(request(0),"buyer@example.com",7L)).getStatusCode().value());verifyNoInteractions(orders,rabbit);
    }
}
