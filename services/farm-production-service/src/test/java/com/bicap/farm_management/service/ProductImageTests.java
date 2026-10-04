package com.bicap.farm_management.service;

import com.bicap.farm_management.controller.MarketplaceProductController;
import com.bicap.farm_management.entity.*;
import com.bicap.farm_management.util.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class ProductImageTests {
    private MockMultipartFile image() throws Exception {
        var bytes = new ByteArrayOutputStream(); ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", bytes);
        return new MockMultipartFile("file", "photo.png", "image/png", bytes.toByteArray());
    }
    @Test void acceptsActualImageAndRejectsSpoofedOrEmptyFiles() throws Exception {
        assertDoesNotThrow(() -> ProductImageValidator.validate(image()));
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> ProductImageValidator.validate(new MockMultipartFile("file", "fake.png", "image/png", "not an image".getBytes()))).getStatusCode().value());
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> ProductImageValidator.validate(new MockMultipartFile("file", new byte[0]))).getStatusCode().value());
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> ProductImageValidator.validate(new MockMultipartFile("file", "test.html", "text/html", "html".getBytes()))).getStatusCode().value());
        assertEquals(413, assertThrows(ResponseStatusException.class, () -> ProductImageValidator.validate(new MockMultipartFile("file", "big.png", "image/png", new byte[5 * 1024 * 1024 + 1]))).getStatusCode().value());
    }
    @Test void callsRealStorageContractAndReturnsStablePublicDownloadUrl() throws Exception {
        var rest = new RestTemplate(); var server = MockRestServiceServer.createServer(rest); var adapter = new ImageStorageService(rest);
        ReflectionTestUtils.setField(adapter, "imageStorageServiceUrl", "http://image-storage-service:8086");
        ReflectionTestUtils.setField(adapter, "publicBaseUrl", "http://localhost:8000");
        server.expect(requestTo("http://image-storage-service:8086/api/v1/images/upload"))
            .andExpect(method(HttpMethod.POST)).andExpect(content().string(org.hamcrest.Matchers.containsString("farm-product-9")))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("PRODUCT")))
            .andRespond(withSuccess("{\"data\":{\"storedFilename\":\"uuid.png\",\"downloadUrl\":\"http://minio:9000/expired\"}}", MediaType.APPLICATION_JSON));
        assertEquals("http://localhost:8000/api/v1/images/download/uuid.png", adapter.uploadImage(image(), 9L, 42L, null)); server.verify();
    }
    @Test void uploadChecksOwnershipBeforeTouchingStorage() throws Exception {
        var products = mock(IMarketplaceProductService.class); var storage = mock(ImageStorageService.class); var security = mock(SecurityUtils.class);
        var own = new Farm(); own.setId(42L); var other = new Farm(); other.setId(99L); var product = new MarketplaceProduct(); product.setFarm(other);
        when(products.getProductById(9L)).thenReturn(product); when(security.getCurrentFarmId()).thenReturn(42L);
        var controller = new MarketplaceProductController(products, storage, security);
        assertEquals(403, assertThrows(ResponseStatusException.class, () -> controller.uploadProductImage(9L, image(), new MockHttpServletRequest())).getStatusCode().value());
        verifyNoInteractions(storage); verify(products, never()).attachProductImage(anyLong(), anyString());
    }
    @Test void failedStorageUploadCannotSubmitProduct() throws Exception {
        var products = mock(IMarketplaceProductService.class); var storage = mock(ImageStorageService.class); var security = mock(SecurityUtils.class);
        var farm = new Farm(); farm.setId(42L); var product = new MarketplaceProduct(); product.setFarm(farm);
        when(products.getProductById(9L)).thenReturn(product); when(security.getCurrentFarmId()).thenReturn(42L);
        when(storage.uploadImage(any(), anyLong(), anyLong(), any())).thenThrow(new ResponseStatusException(HttpStatus.BAD_GATEWAY));
        var controller = new MarketplaceProductController(products, storage, security);
        assertEquals(502, assertThrows(ResponseStatusException.class, () -> controller.uploadProductImage(9L, image(), new MockHttpServletRequest())).getStatusCode().value());
        verify(products, never()).attachProductImage(anyLong(), anyString());
    }
}
