package com.insuretrack.insure_track_backend.Quote_Policy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


import com.insuretrack.common.enums.QuoteStatus;
import com.insuretrack.customer.entity.Customer;
import com.insuretrack.customer.entity.InsuredObject;
import com.insuretrack.customer.repository.CustomerRepository;
import com.insuretrack.customer.repository.InsuredObjectRepository;
import com.insuretrack.product.entity.Product;
import com.insuretrack.product.entity.RatingRule;
import com.insuretrack.product.repository.ProductRepository;
import com.insuretrack.product.repository.RatingRuleRepository;
import com.insuretrack.product.service.RatingRuleService;
import com.insuretrack.quote.dto.QuoteRequestDTO;
import com.insuretrack.quote.dto.QuoteResponseDTO;
import com.insuretrack.quote.entity.Quote;
import com.insuretrack.quote.repository.QuoteRepository;
import com.insuretrack.quote.service.QuoteServiceImpl;
import com.insuretrack.underwriting.service.UnderwritingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;



@ExtendWith(MockitoExtension.class)
public class QuoteServiceImplTest {

    @Mock private QuoteRepository quoteRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private ProductRepository productRepository;
    @Mock private InsuredObjectRepository insuredObjectRepository;
    @Mock private RatingRuleService ratingEngineService;
    @Mock private RatingRuleRepository ratingRuleRepository;
    @Mock private UnderwritingService underwritingService;

    @InjectMocks
    private QuoteServiceImpl quoteService;

    private Customer customer;
    private Product product;
    private InsuredObject insuredObject;

    @BeforeEach
    void init() {
        // Use mocks to avoid depending on constructors/fields you didn’t show
        customer = mock(Customer.class);
        product = mock(Product.class);
        insuredObject = mock(InsuredObject.class);
    }

    @Test
    @DisplayName("createQuote: should build quote from repositories, set DRAFT, save, and return DTO")
    void createQuote_success() {
        // Arrange
        Long customerId = 101L;
        Long productId = 202L;
        Long insuredObjectId = 303L;
        String coveragesJson = "{\"COV_A\": 100000}";

        QuoteRequestDTO request = mock(QuoteRequestDTO.class);
        when(request.getCustomerId()).thenReturn(customerId);
        when(request.getProductId()).thenReturn(productId);
        when(request.getInsuredObjectId()).thenReturn(insuredObjectId);
        when(request.getCoveragesJSON()).thenReturn(coveragesJson);

        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(insuredObjectRepository.findById(insuredObjectId)).thenReturn(Optional.of(insuredObject));

        // We don't rely on the returned entity because the service maps the in-memory object,
        // but we still stub save to avoid NPEs
        when(quoteRepository.save(any(Quote.class))).thenAnswer(invocation -> {
            Quote q = invocation.getArgument(0);
            // Simulate DB assigning ID
            q.setQuoteId(999L);
            return q;
        });

        // Act
        QuoteResponseDTO response = quoteService.createQuote(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(QuoteStatus.DRAFT.name());
        assertThat(response.getPremium()).isNull(); // premium isn't set in create
        assertThat(response.getCreatedDate()).isNotNull();

        // Verify we saved the entity with expected values
        ArgumentCaptor<Quote> quoteCaptor = ArgumentCaptor.forClass(Quote.class);
        verify(quoteRepository, times(1)).save(quoteCaptor.capture());
        Quote saved = quoteCaptor.getValue();
        assertThat(saved.getCustomer()).isSameAs(customer);
        assertThat(saved.getProduct()).isSameAs(product);
        assertThat(saved.getInsuredObject()).isSameAs(insuredObject);
        assertThat(saved.getCoveragesJSON()).isEqualTo(coveragesJson);
        assertThat(saved.getStatus()).isEqualTo(QuoteStatus.DRAFT);
        assertThat(saved.getCreatedDate()).isNotNull();

        verifyNoMoreInteractions(quoteRepository, underwritingService, ratingEngineService);
    }

    @Test
    @DisplayName("submitQuote: should set status SUBMITTED, call underwritingService, and return DTO")
    void submitQuote_success() {
        // Arrange
        Long quoteId = 123L;
        Quote quote = new Quote();
        quote.setQuoteId(quoteId);
        quote.setStatus(QuoteStatus.DRAFT); // not submitted initially
        quote.setCreatedDate(LocalDateTime.now());

        when(quoteRepository.findById(quoteId)).thenReturn(Optional.of(quote));

        // Act
        QuoteResponseDTO response = assertDoesNotThrow(() -> quoteService.submitQuote(quoteId));

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(QuoteStatus.SUBMITTED.name());
        assertThat(response.getQuoteId()).isEqualTo(quoteId);

        // Underwriting case must be created
        verify(underwritingService, times(1)).createCase(quoteId);

        // Service does not call save() in your current code; we assert that behavior to keep tests aligned
        verify(quoteRepository, times(1)).findById(quoteId);
        verifyNoMoreInteractions(quoteRepository);
    }

    @Test
    @DisplayName("rateQuote: should call rating engine, set premium and RATED status, and return DTO")
    void rateQuote_success() {
        // Arrange
        Long quoteId = 456L;

        // Product needs getRatingRules(); we stub it to return an empty list (or your rules)
        List<RatingRule> rules = new ArrayList<>();
        when(product.getRatingRules()).thenReturn(rules);

        Quote quote = new Quote();
        quote.setQuoteId(quoteId);
        quote.setProduct(product);
        quote.setInsuredObject(insuredObject);
        quote.setStatus(QuoteStatus.SUBMITTED);
        quote.setCreatedDate(LocalDateTime.now());

        when(quoteRepository.findById(quoteId)).thenReturn(Optional.of(quote));

        double calculatedPremium = 1234.56;
        when(ratingEngineService.calculatePremium(product, insuredObject, rules))
                .thenReturn(calculatedPremium);

        // Act
        QuoteResponseDTO response = quoteService.rateQuote(quoteId);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getQuoteId()).isEqualTo(quoteId);
        assertThat(response.getPremium()).isEqualTo(calculatedPremium);
        assertThat(response.getStatus()).isEqualTo(QuoteStatus.RATED.name());

        // Verify interactions
        verify(ratingEngineService, times(1)).calculatePremium(product, insuredObject, rules);

        // Service does not call save() in your current code—keep aligned
        verify(quoteRepository, times(1)).findById(quoteId);
        verifyNoMoreInteractions(quoteRepository, ratingEngineService, underwritingService);
    }
}
