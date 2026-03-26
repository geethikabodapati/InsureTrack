package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.quote.entity.Quote;
import com.insuretrack.quote.repository.QuoteRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;        // <-- Mockito matchers
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for repository usage with @InjectMocks + Mockito.
 * We define a tiny SUT wrapper inside this test to satisfy @InjectMocks without adding production classes.
 */
@ExtendWith(MockitoExtension.class)
class QuoteRepositoryTest {

    /**
     * Test-only SUT that delegates to QuoteRepository.
     * This allows us to use @InjectMocks as requested without changing production code.
     */
    static class Sut {
        private final QuoteRepository quoteRepository;
        Sut(QuoteRepository quoteRepository) { this.quoteRepository = quoteRepository; }
        Quote save(Quote q) { return quoteRepository.save(q); }
        Optional<Quote> findById(Long id) { return quoteRepository.findById(id); }
        List<Quote> findAll() { return quoteRepository.findAll(); }
        void deleteById(Long id) { quoteRepository.deleteById(id); }
    }

    @Mock
    private QuoteRepository quoteRepository;

    @InjectMocks
    private Sut sut;

    @Test
    @DisplayName("save(): delegates to repository and returns saved entity")
    void save_delegatesToRepository() {
        // Arrange
        Quote input = Quote.builder()
                .coveragesJSON("{\"OD\":100000}")
                .createdDate(LocalDateTime.now())
                .premium(null)
                .build();

        Quote saved = Quote.builder()
                .quoteId(11L)
                .coveragesJSON("{\"OD\":100000}")
                .createdDate(input.getCreatedDate())
                .premium(null)
                .build();

        when(quoteRepository.save(any(Quote.class))).thenReturn(saved);

        // Act
        Quote result = sut.save(input);

        // Assert interactions
        ArgumentCaptor<Quote> captor = ArgumentCaptor.forClass(Quote.class);
        verify(quoteRepository, times(1)).save(captor.capture());
        Quote passed = captor.getValue();
        assertThat(passed.getCoveragesJSON()).isEqualTo("{\"OD\":100000}");

        // Assert return value
        assertThat(result.getQuoteId()).isEqualTo(11L);
        assertThat(result.getCoveragesJSON()).isEqualTo("{\"OD\":100000}");
        verifyNoMoreInteractions(quoteRepository);
    }

    @Test
    @DisplayName("findById(): delegates and returns Optional result")
    void findById_delegatesToRepository() {
        // Arrange
        Quote entity = Quote.builder().quoteId(42L).build();
        when(quoteRepository.findById(42L)).thenReturn(Optional.of(entity));

        // Act
        Optional<Quote> result = sut.findById(42L);

        // Assert
        verify(quoteRepository, times(1)).findById(42L);
        assertThat(result).isPresent();
        assertThat(result.get().getQuoteId()).isEqualTo(42L);
        verifyNoMoreInteractions(quoteRepository);
    }

    @Test
    @DisplayName("findAll(): delegates and returns list")
    void findAll_delegatesToRepository() {
        // Arrange
        List<Quote> list = Arrays.asList(
                Quote.builder().quoteId(1L).build(),
                Quote.builder().quoteId(2L).build()
        );
        when(quoteRepository.findAll()).thenReturn(list);

        // Act
        List<Quote> result = sut.findAll();

        // Assert
        verify(quoteRepository, times(1)).findAll();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getQuoteId()).isEqualTo(1L);
        assertThat(result.get(1).getQuoteId()).isEqualTo(2L);
        verifyNoMoreInteractions(quoteRepository);
    }

    @Test
    @DisplayName("deleteById(): delegates to repository")
    void deleteById_delegatesToRepository() {
        // Arrange
        doNothing().when(quoteRepository).deleteById(77L);

        // Act
        sut.deleteById(77L);

        // Assert
        verify(quoteRepository, times(1)).deleteById(eq(77L));
        verifyNoMoreInteractions(quoteRepository);
    }
}
