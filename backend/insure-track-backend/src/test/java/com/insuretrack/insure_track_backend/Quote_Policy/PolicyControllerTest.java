package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.policy.controller.PolicyController;
import com.insuretrack.policy.dto.PolicyRequestDTO;
import com.insuretrack.policy.dto.PolicyResponseDTO;
import com.insuretrack.policy.service.PolicyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

/**
 * Pure unit tests for PolicyController using @InjectMocks + @Mock.
 * No MockMvc, no Spring context.
 */
@ExtendWith(MockitoExtension.class)
class PolicyControllerTest {

    @Mock
    private PolicyService policyService;

    @InjectMocks
    private PolicyController policyController;

    @Test
    @DisplayName("POST /issue → returns 200 OK and body from service")
    void issue_ShouldReturnOk() {
        // Arrange
        PolicyRequestDTO request = new PolicyRequestDTO();
        request.setQuoteId(101L);

        PolicyResponseDTO mockResponse = PolicyResponseDTO.builder()
                .policyId(1L)
                .policyNumber("POL-999")
                .status("ACTIVE")
                .build();

        when(policyService.issuePolicy(101L)).thenReturn(mockResponse);

        // Act
        ResponseEntity<PolicyResponseDTO> response = policyController.issue(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getPolicyId()).isEqualTo(1L);
        assertThat(response.getBody().getPolicyNumber()).isEqualTo("POL-999");
        assertThat(response.getBody().getStatus()).isEqualTo("ACTIVE");

        verify(policyService, times(1)).issuePolicy(101L);
        verifyNoMoreInteractions(policyService);
    }

    @Test
    @DisplayName("GET /{policyId} → returns 200 OK and body from service")
    void get_ShouldReturnOk() {
        // Arrange
        Long policyId = 5L;

        PolicyResponseDTO mockResponse = PolicyResponseDTO.builder()
                .policyId(policyId)
                .policyNumber("POL-12345")
                .status("ACTIVE")
                .build();

        when(policyService.getPolicy(policyId)).thenReturn(mockResponse);

        // Act
        ResponseEntity<PolicyResponseDTO> response = policyController.get(policyId);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getPolicyId()).isEqualTo(policyId);
        assertThat(response.getBody().getPolicyNumber()).isEqualTo("POL-12345");

        verify(policyService, times(1)).getPolicy(policyId);
        verifyNoMoreInteractions(policyService);
    }

    @Test
    @DisplayName("GET /{policyId} → propagates RuntimeException when service throws")
    void get_ShouldPropagateException() {
        // Arrange
        Long policyId = 404L;
        when(policyService.getPolicy(policyId)).thenThrow(new RuntimeException("Policy not found"));

        // Act + Assert (without @ControllerAdvice, exception bubbles up)
        RuntimeException ex = assertThrows(RuntimeException.class, () -> policyController.get(policyId));
        assertThat(ex).hasMessageContaining("Policy not found");

        verify(policyService, times(1)).getPolicy(policyId);
        verifyNoMoreInteractions(policyService);
    }
}