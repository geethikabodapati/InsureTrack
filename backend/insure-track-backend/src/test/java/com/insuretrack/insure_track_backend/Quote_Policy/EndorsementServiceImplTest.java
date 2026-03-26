package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.common.enums.ChangeType;
import com.insuretrack.common.enums.EndorsementStatus;
import com.insuretrack.policy.dto.EndorsementRequestDTO;
import com.insuretrack.policy.dto.EndorsementResponseDTO;
import com.insuretrack.policy.entity.Endorsement;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.repository.EndorsementRepository;
import com.insuretrack.policy.repository.PolicyRepository;
import com.insuretrack.policy.service.EndorsementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
        import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EndorsementServiceImplTest {

    @Mock
    private EndorsementRepository endorsementRepository;

    @Mock
    private PolicyRepository policyRepository;

    @InjectMocks
    private EndorsementServiceImpl endorsementService;

    private EndorsementRequestDTO requestDTO;
    private Policy mockPolicy;

    @BeforeEach
    void setUp() {
        requestDTO = new EndorsementRequestDTO();
        requestDTO.setPolicyId(1L);
        requestDTO.setChangeType("ADD_COVERAGE"); // Ensure this matches your ChangeType enum
        requestDTO.setPremiumDelta(150.0);

        mockPolicy = new Policy();
        mockPolicy.setPolicyId(1L);
    }

    @Test
    void create_ShouldReturnResponse_WhenPolicyExists() {
        // Arrange
        when(policyRepository.findById(1L)).thenReturn(Optional.of(mockPolicy));

        // Mocking the save to return an endorsement with an ID (simulating DB behavior)
        when(endorsementRepository.save(any(Endorsement.class))).thenAnswer(invocation -> {
            Endorsement e = invocation.getArgument(0);
            // Reflectively or via setter set the ID if needed for the DTO mapping
            // Note: In your code it uses endorsement.getEnodrsementId()
            return e;
        });

        // Act
        EndorsementResponseDTO response = endorsementService.create(requestDTO);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getPolicyId());
        assertEquals("ADD_COVERAGE", response.getChangeType());
        assertEquals(EndorsementStatus.PENDING.name(), response.getStatus());

        verify(policyRepository, times(1)).findById(1L);
        verify(endorsementRepository, times(1)).save(any(Endorsement.class));
    }

    @Test
    void create_ShouldThrowException_WhenPolicyNotFound() {
        // Arrange
        when(policyRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            endorsementService.create(requestDTO);
        });

        assertEquals("Policy not found", exception.getMessage());
        verify(endorsementRepository, never()).save(any(Endorsement.class));
    }
}
