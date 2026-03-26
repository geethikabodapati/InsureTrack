package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.policy.entity.Cancellation;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.repository.CancellationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CancellationRepositoryTest {

    @Mock
    private CancellationRepository cancellationRepository;

    private Cancellation mockCancellation;
    private Policy mockPolicy;

    @BeforeEach
    void setUp() {
        mockPolicy = Policy.builder()
                .policyId(1L)
                .build();

        mockCancellation = Cancellation.builder()
                .cancellationId(100L)
                .policy(mockPolicy)
                .reason("Found better rate")
                .effectiveDate(LocalDate.now())
                .build();
    }

    @Test
    @DisplayName("Should mock findByPolicyPolicyId and return list")
    void findByPolicyPolicyId_Test() {
        // Arrange
        when(cancellationRepository.findByPolicyPolicyId(1L))
                .thenReturn(List.of(mockCancellation));

        // Act
        List<Cancellation> results = cancellationRepository.findByPolicyPolicyId(1L);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(100L, results.get(0).getCancellationId());
        assertEquals(1L, results.get(0).getPolicy().getPolicyId());

        verify(cancellationRepository, times(1)).findByPolicyPolicyId(1L);
    }

    @Test
    @DisplayName("Should mock findById from JpaRepository")
    void findById_Test() {
        // Arrange
        when(cancellationRepository.findById(100L)).thenReturn(Optional.of(mockCancellation));

        // Act
        Optional<Cancellation> result = cancellationRepository.findById(100L);

        // Assert
        assertEquals(true, result.isPresent());
        assertEquals("Found better rate", result.get().getReason());
        verify(cancellationRepository, times(1)).findById(100L);
    }
}