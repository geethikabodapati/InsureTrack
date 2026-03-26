package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.common.enums.PolicyStatus;
import com.insuretrack.policy.dto.PolicyResponseDTO;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.repository.PolicyRepository;
import com.insuretrack.policy.service.PolicyServiceImpl;
import com.insuretrack.quote.entity.Quote;
import com.insuretrack.quote.repository.QuoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
        import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PolicyServiceImplTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private QuoteRepository quoteRepository;

    @InjectMocks
    private PolicyServiceImpl policyService;

    private Quote mockQuote;
    private Policy mockPolicy;

    @BeforeEach
    void setUp() {
        mockQuote = Quote.builder()
                .quoteId(101L)
                .premium(500.0)
                .build();

        mockPolicy = Policy.builder()
                .policyId(1L)
                .quote(mockQuote)
                .policyNumber("POL-12345")
                .premium(500.0)
                .status(PolicyStatus.ACTIVE)
                .build();
    }



    @Test
    @DisplayName("Should successfully issue a policy when quote exists")
    void issuePolicy_Success() {
        // Arrange
        when(quoteRepository.findById(101L)).thenReturn(Optional.of(mockQuote));
        when(policyRepository.save(any(Policy.class))).thenReturn(mockPolicy);

        // Act
        PolicyResponseDTO response = policyService.issuePolicy(101L);

        // Assert
        assertNotNull(response);
        assertEquals(500.0, response.getPremium());
        assertTrue(response.getPolicyNumber().startsWith("POL-"));
        assertEquals("ACTIVE", response.getStatus());

        verify(quoteRepository, times(1)).findById(101L);
        verify(policyRepository, times(1)).save(any(Policy.class));
    }

    @Test
    @DisplayName("Should throw exception when issuing policy for non-existent quote")
    void issuePolicy_QuoteNotFound() {
        // Arrange
        when(quoteRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            policyService.issuePolicy(999L);
        });

        assertEquals("Quote not found", exception.getMessage());
        verify(policyRepository, never()).save(any(Policy.class));
    }

    @Test
    @DisplayName("Should successfully retrieve policy by ID")
    void getPolicy_Success() {
        // Arrange
        when(policyRepository.findById(1L)).thenReturn(Optional.of(mockPolicy));

        // Act
        PolicyResponseDTO response = policyService.getPolicy(1L);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getPolicyId());
        assertEquals("POL-12345", response.getPolicyNumber());

        verify(policyRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when policy does not exist")
    void getPolicy_NotFound() {
        // Arrange
        when(policyRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            policyService.getPolicy(1L);
        });

        assertEquals("Policy not found", exception.getMessage());
    }
}
