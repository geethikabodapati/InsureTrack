package com.insuretrack.insure_track_backend.underwriting;
import com.insuretrack.underwriting.controller.UnderwritingController;
import com.insuretrack.underwriting.dto.UnderwritingDecisionDTO;
import com.insuretrack.underwriting.dto.UnderwritingResponseDTO;
import com.insuretrack.underwriting.service.UnderwritingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UnderwritingControllerTest {

    @Mock
    private UnderwritingService underwritingService;

    @InjectMocks
    private UnderwritingController underwritingController;

    @Test
    @DisplayName("POST /{quoteId} - Should create a case")
    void createCase_ShouldReturnResponse() {
        // Arrange
        Long quoteId = 500L;
        UnderwritingResponseDTO expectedResponse = UnderwritingResponseDTO.builder()
                .uwCaseId(1L)
                .quoteId(quoteId)
                .build();

        when(underwritingService.createCase(quoteId)).thenReturn(expectedResponse);

        // Act
        UnderwritingResponseDTO actualResponse = underwritingController.createCase(quoteId);

        // Assert
        assertThat(actualResponse).isNotNull();
        assertThat(actualResponse.getQuoteId()).isEqualTo(500L);
    }

    @Test
    @DisplayName("GET /pending - Should return list of pending cases")
    void getPending_ShouldReturnList() {
        // Arrange
        UnderwritingResponseDTO case1 = UnderwritingResponseDTO.builder().uwCaseId(1L).build();
        List<UnderwritingResponseDTO> mockList = List.of(case1);

        when(underwritingService.getPendingCases()).thenReturn(mockList);

        // Act
        List<UnderwritingResponseDTO> result = underwritingController.getPending();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUwCaseId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("PUT /{caseId}/decision - Should process decision and return 200 OK")
    void decide_ShouldReturnOkResponse() {
        // Arrange
        Long caseId = 1L;
        UnderwritingDecisionDTO decisionRequest = new UnderwritingDecisionDTO("APPROVE", "Low risk profile");
        UnderwritingResponseDTO mockResponse = UnderwritingResponseDTO.builder()
                .uwCaseId(caseId)
                .status("APPROVED")
                .build();

        when(underwritingService.makeDecision(eq(caseId), any(UnderwritingDecisionDTO.class)))
                .thenReturn(mockResponse);

        // Act
        ResponseEntity<UnderwritingResponseDTO> responseEntity = underwritingController.decide(caseId, decisionRequest);

        // Assert
        assertThat(responseEntity.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(responseEntity.getBody()).isNotNull();
        assertThat(responseEntity.getBody().getStatus()).isEqualTo("APPROVED");
    }
}