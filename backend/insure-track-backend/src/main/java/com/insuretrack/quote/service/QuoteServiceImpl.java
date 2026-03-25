package com.insuretrack.quote.service;
import com.insuretrack.common.enums.NotificationCategory;
import com.insuretrack.common.enums.QuoteStatus;
import com.insuretrack.common.enums.UserRole;
import com.insuretrack.customer.repository.CustomerRepository;
import com.insuretrack.customer.repository.InsuredObjectRepository;
import com.insuretrack.notification.service.NotificationService;
import com.insuretrack.product.repository.ProductRepository;
import com.insuretrack.product.repository.RatingRuleRepository;
import com.insuretrack.product.service.RatingRuleService;
import com.insuretrack.quote.dto.QuoteRequestDTO;
import com.insuretrack.quote.dto.QuoteResponseDTO;
import com.insuretrack.quote.entity.Quote;
import com.insuretrack.quote.repository.QuoteRepository;
import com.insuretrack.underwriting.service.UnderwritingService;
import com.insuretrack.user.entity.User;
import com.insuretrack.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.DecimalMax;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class QuoteServiceImpl implements QuoteService {


    private final QuoteRepository quoteRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InsuredObjectRepository insuredObjectRepository;
    private final RatingRuleService ratingEngineService;
    private final RatingRuleRepository ratingRuleRepository;
    private final UnderwritingService underwritingService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Override
    public QuoteResponseDTO createQuote(QuoteRequestDTO request) {

        Quote quote = new Quote();
        quote.setCustomer(customerRepository.findById(request.getCustomerId()).orElseThrow());
        quote.setProduct(productRepository.findById(request.getProductId()).orElseThrow());
        quote.setInsuredObject(
                insuredObjectRepository.findById(request.getInsuredObjectId()).orElseThrow()
        );
        quote.setCoveragesJSON(request.getCoveragesJSON());
        quote.setCreatedDate(LocalDateTime.now());
        quote.setStatus(QuoteStatus.DRAFT);

        quoteRepository.save(quote);
        return mapToResponse(quote);
    }
    @Override
    public QuoteResponseDTO submitQuote(Long quoteId) {

        Quote quote = quoteRepository.findById(quoteId).orElseThrow();
        if(quote.getStatus().name()=="SUBMITTED"){
            throw new RuntimeException("Already in pending state");
        }
        quote.setStatus(QuoteStatus.SUBMITTED);
        Long underwriterId = userRepository.findFirstByRole(UserRole.UNDERWRITER) // Use the actual Enum
                .map(User::getUserId)
                .orElseThrow(() -> new RuntimeException("No Underwriter available to notify"));

        // 2. Pass the retrieved ID to the notification service
        notificationService.createNotification(
                underwriterId,
                "New Quote #" + quoteId + " has been submitted for review.",
                NotificationCategory.UNDERWRITING
        );
        underwritingService.createCase(quoteId);
        return mapToResponse(quote);
    }

    @Override
    public QuoteResponseDTO rateQuote(Long quoteId) {

        Quote quote = quoteRepository.findById(quoteId).orElseThrow();

        Double premium = ratingEngineService.calculatePremium(quote.getProduct(),quote.getInsuredObject(),quote.getProduct().getRatingRules());

        quote.setPremium(premium);
        quote.setStatus(QuoteStatus.RATED);

        return mapToResponse(quote);
    }

    @Override
    public List<QuoteResponseDTO> findAllQuotes() {
        return quoteRepository.findAll()
                .stream()
                .map(this::mapToResponse) // Uses your existing mapping method
                .toList();
    }
    @Override
    public List<QuoteResponseDTO> getQuotesByCustomerId(Long customerId) {
        // This fixes the "Incompatible Types" error by returning a proper List<Quote>
        List<Quote> quotes = quoteRepository.findByCustomer_CustomerId(customerId);

        return quotes.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private QuoteResponseDTO mapToResponse(Quote quote) {

        QuoteResponseDTO dto = new QuoteResponseDTO();
        dto.setQuoteId(quote.getQuoteId());
        dto.setPremium(quote.getPremium());
        dto.setStatus(quote.getStatus().name());
        dto.setCreatedDate(quote.getCreatedDate());
        dto.setCustomerName(quote.getCustomer().getName());
        dto.setInsuredObjectId(quote.getInsuredObject().getObjectId());
        return dto;
    }

}