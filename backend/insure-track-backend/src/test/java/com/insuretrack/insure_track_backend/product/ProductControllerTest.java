package com.insuretrack.insure_track_backend.product;

import com.insuretrack.common.enums.Status;
import com.insuretrack.product.controller.ProductController;
import com.insuretrack.product.dto.ProductRequestDTO;
import com.insuretrack.product.dto.ProductResponseDTO;
import com.insuretrack.product.service.ProductService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class) // This replaces @WebMvcTest
public class ProductControllerTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    @Test
    void testCreateProduct() {
        // 1. Arrange
        ProductRequestDTO request = new ProductRequestDTO();
        request.setName("CAR");

        ProductResponseDTO response = ProductResponseDTO.builder()
                .productId(1L)
                .name("CAR")
                .status(Status.ACTIVE)
                .coverages(Collections.emptyList())
                .ratingRules(Collections.emptyList())
                .build();

        when(productService.createProduct(any(ProductRequestDTO.class))).thenReturn(response);

        // 2. Act
        // Call the method directly. No MockMvc, no JSON strings.
        ProductResponseDTO result = productController.createProduct(request);

        // 3. Assert
        assertEquals("CAR", result.getName());
        assertEquals(Status.ACTIVE, result.getStatus());
    }
}