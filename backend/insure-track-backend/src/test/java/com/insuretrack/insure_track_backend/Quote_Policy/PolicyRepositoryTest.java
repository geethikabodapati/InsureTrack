package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.common.enums.PolicyStatus;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.repository.PolicyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;       // Mockito matchers
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for repository usage with @InjectMocks + Mockito.
 * Defines a tiny SUT wrapper INSIDE this test to satisfy @InjectMocks without modifying production code.
 */
@ExtendWith(MockitoExtension.class)
public class PolicyRepositoryTest {

    /**
     * Test-only SUT that delegates to PolicyRepository.
     * This allows using @InjectMocks (class under test) with a mocked repository.
     */
    static class Sut {
        private final PolicyRepository repo;
        Sut(PolicyRepository repo) { this.repo = repo; }
        Policy save(Policy p) { return repo.save(p); }
        Optional<Policy> findById(Long id) { return repo.findById(id); }
        List<Policy> findAll() { return repo.findAll(); }
        void deleteById(Long id) { repo.deleteById(id); }
        Optional<Policy> findByQuoteQuoteId(Long quoteId) { return repo.findByQuoteQuoteId(quoteId); }
        List<Policy> findByStatus(PolicyStatus status) { return repo.findByStatus(status); }
    }

    @Mock
    private PolicyRepository policyRepository;

    @InjectMocks
    private Sut sut;

    @Test
    @DisplayName("save(): delegates to repository and returns saved Policy")
    void save_delegates() {
        // Arrange
        Policy toSave = Policy.builder()
                .policyNumber("POL-1001")
                .effectiveDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(1))
                .status(PolicyStatus.ACTIVE)
                .premium(2500.0)
                .build();

        Policy saved = Policy.builder()
                .policyId(10L)
                .policyNumber("POL-1001")
                .effectiveDate(toSave.getEffectiveDate())
                .expiryDate(toSave.getExpiryDate())
                .status(PolicyStatus.ACTIVE)
                .premium(2500.0)
                .build();

        when(policyRepository.save(any(Policy.class))).thenReturn(saved);

        // Act
        Policy result = sut.save(toSave);

        // Assert (interaction + return value)
        ArgumentCaptor<Policy> captor = ArgumentCaptor.forClass(Policy.class);
        verify(policyRepository, times(1)).save(captor.capture());
        Policy passed = captor.getValue();
        assertThat(passed.getPolicyNumber()).isEqualTo("POL-1001");

        assertThat(result.getPolicyId()).isEqualTo(10L);
        assertThat(result.getStatus()).isEqualTo(PolicyStatus.ACTIVE);
        verifyNoMoreInteractions(policyRepository);
    }

    @Test
    @DisplayName("findById(): delegates and returns Optional")
    void findById_delegates() {
        Policy entity = Policy.builder()
                .policyId(42L)
                .policyNumber("POL-0042")
                .status(PolicyStatus.ACTIVE)
                .build();

        when(policyRepository.findById(42L)).thenReturn(Optional.of(entity));

        Optional<Policy> result = sut.findById(42L);

        verify(policyRepository, times(1)).findById(42L);
        assertThat(result).isPresent();
        assertThat(result.get().getPolicyId()).isEqualTo(42L);
        assertThat(result.get().getPolicyNumber()).isEqualTo("POL-0042");
        verifyNoMoreInteractions(policyRepository);
    }

    @Test
    @DisplayName("findAll(): delegates and returns list")
    void findAll_delegates() {
        List<Policy> list = Arrays.asList(
                Policy.builder().policyId(1L).policyNumber("POL-0001").build(),
                Policy.builder().policyId(2L).policyNumber("POL-0002").build()
        );
        when(policyRepository.findAll()).thenReturn(list);

        List<Policy> result = sut.findAll();

        verify(policyRepository, times(1)).findAll();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getPolicyId()).isEqualTo(1L);
        assertThat(result.get(1).getPolicyId()).isEqualTo(2L);
        verifyNoMoreInteractions(policyRepository);
    }

    @Test
    @DisplayName("deleteById(): delegates to repository")
    void deleteById_delegates() {
        doNothing().when(policyRepository).deleteById(99L);

        sut.deleteById(99L);

        verify(policyRepository, times(1)).deleteById(eq(99L));
        verifyNoMoreInteractions(policyRepository);
    }

    @Test
    @DisplayName("findByQuoteQuoteId(): delegates and returns Optional policy")
    void findByQuoteQuoteId_delegates() {
        Policy entity = Policy.builder()
                .policyId(7L)
                .policyNumber("POL-0007")
                .status(PolicyStatus.ACTIVE)
                .build();

        when(policyRepository.findByQuoteQuoteId(123L)).thenReturn(Optional.of(entity));

        Optional<Policy> result = sut.findByQuoteQuoteId(123L);

        verify(policyRepository, times(1)).findByQuoteQuoteId(123L);
        assertThat(result).isPresent();
        assertThat(result.get().getPolicyId()).isEqualTo(7L);
        verifyNoMoreInteractions(policyRepository);
    }

    @Test
    @DisplayName("findByStatus(): delegates and returns matching policies")
    void findByStatus_delegates() {
        List<Policy> list = Arrays.asList(
                Policy.builder().policyId(5L).status(PolicyStatus.ACTIVE).build(),
                Policy.builder().policyId(6L).status(PolicyStatus.ACTIVE).build()
        );

        when(policyRepository.findByStatus(PolicyStatus.ACTIVE)).thenReturn(list);

        List<Policy> result = sut.findByStatus(PolicyStatus.ACTIVE);

        verify(policyRepository, times(1)).findByStatus(PolicyStatus.ACTIVE);
        assertThat(result).hasSize(2);
        assertThat(result.stream().allMatch(p -> p.getStatus() == PolicyStatus.ACTIVE)).isTrue();
        verifyNoMoreInteractions(policyRepository);
    }
}
