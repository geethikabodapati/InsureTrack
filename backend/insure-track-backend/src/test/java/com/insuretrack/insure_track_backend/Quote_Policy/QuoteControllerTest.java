package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.quote.controller.QuoteController;
import com.insuretrack.quote.dto.QuoteRequestDTO;
import com.insuretrack.quote.dto.QuoteResponseDTO;
import com.insuretrack.quote.service.QuoteService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuoteControllerTest {

    @Mock
    private QuoteService quoteService;

    @InjectMocks
    private QuoteController quoteController;

    @Test
    @DisplayName("1. Create Draft: POST /draft")
    void createDraft_ShouldReturnOk() {
        // Arrange
        QuoteRequestDTO request = QuoteRequestDTO.builder()
                .customerId(1L)
                .productId(10L)
                .insuredObjectId(100L)
                .coveragesJSON("{\"fire\": true}")
                .build();

        QuoteResponseDTO mockResponse = QuoteResponseDTO.builder()
                .quoteId(101L)
                .status("DRAFT")
                .build();

        when(quoteService.createQuote(any(QuoteRequestDTO.class))).thenReturn(mockResponse);

        // Act
        ResponseEntity<QuoteResponseDTO> response = quoteController.createDraft(request);

        // Assert
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getQuoteId()).isEqualTo(101L);
    }
    @Test
    @DisplayName("2. Submit Quote: PUT /{id}/submit")
    void submitQuote_ShouldReturnOk() {
        // Arrange
        Long quoteId = 1L;
        QuoteResponseDTO mockResponse = QuoteResponseDTO.builder()
                .quoteId(quoteId)
                .status("SUBMITTED")
                .build();

        when(quoteService.submitQuote(quoteId)).thenReturn(mockResponse);

        // Act
        ResponseEntity<QuoteResponseDTO> response = quoteController.submitQuote(quoteId);

        // Assert
        // FIX: Use .getStatusCode().value()
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getStatus()).isEqualTo("SUBMITTED");
    }

    @Test
    @DisplayName("3. Rate Quote: PUT /{id}/rate")
    void rateQuote_ShouldReturnOk() {
        // Arrange
        Long quoteId = 1L;
        QuoteResponseDTO mockResponse = QuoteResponseDTO.builder()
                .quoteId(quoteId)
                .status("RATED")
                .premium(500.0)
                .build();

        when(quoteService.rateQuote(quoteId)).thenReturn(mockResponse);

        // Act
        ResponseEntity<QuoteResponseDTO> response = quoteController.rateQuote(quoteId);

        // Assert
        // FIX: Use .getStatusCode().value() and correct AssertJ syntax
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getPremium()).isEqualTo(500.0);
    }
}