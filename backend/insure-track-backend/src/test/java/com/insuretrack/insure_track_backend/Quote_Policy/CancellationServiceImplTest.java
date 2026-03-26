package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.common.enums.PolicyStatus;
import com.insuretrack.policy.dto.CancellationRequestDTO;
import com.insuretrack.policy.dto.CancellationResponseDTO;
import com.insuretrack.policy.entity.Cancellation;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.repository.CancellationRepository;
import com.insuretrack.policy.repository.PolicyRepository;
import com.insuretrack.policy.service.CancellationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
        import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CancellationServiceImplTest {

    @Mock
    private CancellationRepository cancellationRepository;

    @Mock
    private PolicyRepository policyRepository;

    @InjectMocks
    private CancellationServiceImpl cancellationService;

    private Policy mockPolicy;
    private CancellationRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        mockPolicy = Policy.builder()
                .policyId(1L)
                .status(PolicyStatus.ACTIVE)
                .build();

        requestDTO = new CancellationRequestDTO();
        requestDTO.setPolicyId(1L);
        requestDTO.setReason("Customer moved out of state");
    }

    @Test
    @DisplayName("Should successfully cancel a policy and return response")
    void cancel_Success() {
        // Arrange
        when(policyRepository.findById(1L)).thenReturn(Optional.of(mockPolicy));
        // Using any() because the service creates a new Cancellation instance inside the method
        when(cancellationRepository.save(any(Cancellation.class))).thenAnswer(invocation -> {
            Cancellation saved = invocation.getArgument(0);
            saved.setCancellationId(100L); // Simulate DB generating an ID
            return saved;
        });

        // Act
        CancellationResponseDTO result = cancellationService.cancel(requestDTO);

        // Assert
        assertNotNull(result);
        assertEquals(100L, result.getCancellationId());
        assertEquals(PolicyStatus.CANCELLED, mockPolicy.getStatus());
        assertEquals(requestDTO.getReason(), result.getReason());

        verify(policyRepository, times(1)).findById(1L);
        verify(cancellationRepository, times(1)).save(any(Cancellation.class));
    }

    @Test
    @DisplayName("Should throw exception when policy is not found")
    void cancel_PolicyNotFound() {
        // Arrange
        when(policyRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            cancellationService.cancel(requestDTO);
        });

        assertEquals("Policy not found", exception.getMessage());
        verify(cancellationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return a list of cancellations for a specific policy")
    void getByPolicy_Success() {
        // Arrange
        Cancellation cancellation = Cancellation.builder()
                .cancellationId(50L)
                .policy(mockPolicy)
                .reason("Test Reason")
                .effectiveDate(LocalDate.now())
                .build();

        when(cancellationRepository.findByPolicyPolicyId(1L)).thenReturn(List.of(cancellation));

        // Act
        List<CancellationResponseDTO> results = cancellationService.getByPolicy(1L);

        // Assert
        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
        assertEquals(50L, results.get(0).getCancellationId());
        verify(cancellationRepository, times(1)).findByPolicyPolicyId(1L);
    }
}