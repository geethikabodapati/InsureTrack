package com.insuretrack.insure_track_backend.Quote_Policy;



import com.insuretrack.common.enums.RenewalStatus;
import com.insuretrack.policy.dto.RenewalRequestDTO;
import com.insuretrack.policy.dto.RenewalResponseDTO;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.entity.Renewal;
import com.insuretrack.policy.repository.PolicyRepository;
import com.insuretrack.policy.repository.RenewalRepository;
import com.insuretrack.policy.service.RenewalServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
        import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RenewalServiceImplTest {

    @Mock
    private RenewalRepository renewalRepository;

    @Mock
    private PolicyRepository policyRepository;

    @InjectMocks
    private RenewalServiceImpl renewalService;

    private Policy mockPolicy;
    private RenewalRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        mockPolicy = new Policy();
        mockPolicy.setPolicyId(101L);

        requestDTO = new RenewalRequestDTO();
        requestDTO.setPolicyId(101L);
        requestDTO.setProposedPremium(1500.0);
    }

    @Test
    void createOffer_ShouldSucceed_WhenPolicyExists() {
        // Arrange
        when(policyRepository.findById(101L)).thenReturn(Optional.of(mockPolicy));
        // Simulate DB assigning an ID upon save
        when(renewalRepository.save(any(Renewal.class))).thenAnswer(invocation -> {
            Renewal r = invocation.getArgument(0);
            return r;
        });

        // Act
        RenewalResponseDTO response = renewalService.createOffer(requestDTO);

        // Assert
        assertNotNull(response);
        assertEquals(101L, response.getPolicyId());
        assertEquals(1500.0, response.getProposedPremium());
        assertEquals(RenewalStatus.OFFERED.name(), response.getStatus());

        verify(policyRepository).findById(101L);
        verify(renewalRepository).save(any(Renewal.class));
    }

    @Test
    void createOffer_ShouldThrowException_WhenPolicyNotFound() {
        // Arrange
        when(policyRepository.findById(101L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                renewalService.createOffer(requestDTO)
        );

        assertEquals("Policy not found", exception.getMessage());
        verify(renewalRepository, never()).save(any(Renewal.class));
    }

    @Test
    void getByPolicy_ShouldReturnMappedDtoList() {
        // Arrange
        Renewal renewal1 = Renewal.builder()
                .renewalId(1L)
                .policy(mockPolicy)
                .proposedPremium(1200.0)
                .offerDate(LocalDate.now())
                .status(RenewalStatus.OFFERED)
                .build();

        when(renewalRepository.findByPolicyPolicyId(101L)).thenReturn(Arrays.asList(renewal1));

        // Act
        List<RenewalResponseDTO> results = renewalService.getByPolicy(101L);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(1200.0, results.get(0).getProposedPremium());
        assertEquals(101L, results.get(0).getPolicyId());

        verify(renewalRepository).findByPolicyPolicyId(101L);
    }
}