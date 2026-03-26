package com.insuretrack.insure_track_backend.underwriting;
import com.insuretrack.common.enums.QuoteStatus;
import com.insuretrack.common.enums.UnderwritingDecision;
import com.insuretrack.policy.service.PolicyService;
import com.insuretrack.quote.entity.Quote;
import com.insuretrack.quote.repository.QuoteRepository;
import com.insuretrack.underwriting.dto.UnderwritingDecisionDTO;
import com.insuretrack.underwriting.dto.UnderwritingResponseDTO;
import com.insuretrack.underwriting.entity.UnderwritingCase;
import com.insuretrack.underwriting.repository.UnderwritingCaseRepository;
import com.insuretrack.underwriting.service.UnderwritingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UnderwritingServiceImplTest {

    @Mock private UnderwritingCaseRepository underwritingRepository;
    @Mock private QuoteRepository quoteRepository;
    @Mock private PolicyService policyService;

    @InjectMocks private UnderwritingServiceImpl underwritingService;

    private Quote sampleQuote;
    private UnderwritingCase pendingCase;

    @BeforeEach
    void setUp() {
        sampleQuote = new Quote();
        sampleQuote.setQuoteId(500L);
        sampleQuote.setStatus(QuoteStatus.SUBMITTED);

        pendingCase = UnderwritingCase.builder()
                .uwCaseId(1L)
                .quote(sampleQuote)
                .decision(UnderwritingDecision.PENDING) // Must be PENDING for tests to pass
                .decisionDate(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("1. Create Case: Success path")
    void createCase_Success() {
        when(quoteRepository.findById(500L)).thenReturn(Optional.of(sampleQuote));
        when(underwritingRepository.save(any(UnderwritingCase.class))).thenReturn(pendingCase);

        UnderwritingResponseDTO response = underwritingService.createCase(500L);

        assertThat(response.getQuoteId()).isEqualTo(500L);
    }

    @Test
    @DisplayName("2. Create Case: Quote ID invalid")
    void createCase_NotFound() {
        when(quoteRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> underwritingService.createCase(99L));
    }

    // Import this at the top


    @Test
    @DisplayName("3. Make Decision: DECLINE path")
    void makeDecision_Decline_Success() {
        UnderwritingDecisionDTO dto = new UnderwritingDecisionDTO("DECLINE", "High risk");

        when(underwritingRepository.findById(1L)).thenReturn(Optional.of(pendingCase));
        // FIX: Tell the mock to return the case instead of null when saving
        when(underwritingRepository.save(any(UnderwritingCase.class))).thenReturn(pendingCase);

        underwritingService.makeDecision(1L, dto);

        assertThat(sampleQuote.getStatus()).isEqualTo(QuoteStatus.REJECTED);
        verify(policyService, never()).issuePolicy(anyLong());
    }

    @Test
    @DisplayName("4. State Guard: Throw error if decision already made")
    void makeDecision_AlreadyProcessed() {
        // Set the case to something other than PENDING
        pendingCase.setDecision(UnderwritingDecision.APPROVE);
        when(underwritingRepository.findById(1L)).thenReturn(Optional.of(pendingCase));
        UnderwritingDecisionDTO dto = new UnderwritingDecisionDTO("DECLINE", "Try again");

        // After you fix the service, this will catch the RuntimeException correctly
        assertThrows(RuntimeException.class, () -> underwritingService.makeDecision(1L, dto));
    }

    @Test
    @DisplayName("5. Get Pending: Filter logic")
    void getPendingCases_Filtering() {
        UnderwritingCase closed = UnderwritingCase.builder().decision(UnderwritingDecision.APPROVE).build();
        when(underwritingRepository.findAll()).thenReturn(List.of(pendingCase, closed));

        List<UnderwritingResponseDTO> results = underwritingService.getPendingCases();

        assertThat(results).hasSize(1);
    }

    @Test
    @DisplayName("6. Get Case: Read path")
    void getCase_Success() {
        when(underwritingRepository.findById(1L)).thenReturn(Optional.of(pendingCase));
        UnderwritingResponseDTO result = underwritingService.getCase(1L);
        assertThat(result.getUwCaseId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("7. Mapping: Verify quote ID extraction")
    void mapping_VerifyDetails() {
        when(underwritingRepository.findById(1L)).thenReturn(Optional.of(pendingCase));
        UnderwritingResponseDTO result = underwritingService.getCase(1L);
        assertThat(result.getQuoteId()).isEqualTo(500L);
    }
}