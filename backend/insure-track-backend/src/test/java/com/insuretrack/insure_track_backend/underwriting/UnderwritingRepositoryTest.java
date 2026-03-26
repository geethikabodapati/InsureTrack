package com.insuretrack.insure_track_backend.underwriting;
import com.insuretrack.underwriting.entity.UnderwritingCase;
import com.insuretrack.quote.entity.Quote;
import com.insuretrack.underwriting.repository.UnderwritingCaseRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UnderwritingRepositoryTest {

    @Mock
    private UnderwritingCaseRepository underwritingCaseRepository;

    @Test
    @DisplayName("Find Case by Quote ID - Mock Path")
    void findByQuoteQuoteId_ShouldReturnCase() {
        // Arrange
        Long quoteId = 500L;

        // Mocking the nested relationship logic
        Quote mockQuote = new Quote();
        mockQuote.setQuoteId(quoteId);

        UnderwritingCase mockCase = UnderwritingCase.builder()
                .uwCaseId(1L)
                .quote(mockQuote)
                .build();

        when(underwritingCaseRepository.findByQuoteQuoteId(quoteId))
                .thenReturn(Optional.of(mockCase));

        // Act
        Optional<UnderwritingCase> result = underwritingCaseRepository.findByQuoteQuoteId(quoteId);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getQuote().getQuoteId()).isEqualTo(500L);
        assertThat(result.get().getUwCaseId()).isEqualTo(1L);
    }
}