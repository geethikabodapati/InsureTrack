//package com.insuretrack.underwriting.service;
//
//import com.insuretrack.common.enums.QuoteStatus;
//import com.insuretrack.common.enums.UnderwritingDecision;
//import com.insuretrack.policy.service.PolicyService;
//import com.insuretrack.product.entity.Product;
//import com.insuretrack.product.repository.ProductRepository;
//import com.insuretrack.quote.entity.Quote;
//import com.insuretrack.quote.repository.QuoteRepository;
//import com.insuretrack.underwriting.dto.UnderwritingDecisionDTO;
//import com.insuretrack.underwriting.dto.UnderwritingRequestDTO;
//import com.insuretrack.underwriting.dto.UnderwritingResponseDTO;
//import com.insuretrack.underwriting.entity.UnderwritingCase;
//import com.insuretrack.underwriting.repository.UnderwritingCaseRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//import static com.insuretrack.underwriting.entity.UnderwritingCase.*;
//
//@Service
//@RequiredArgsConstructor
//public class UnderwritingServiceImpl implements UnderwritingService {
//
//    private final UnderwritingCaseRepository underwritingRepository;
//    private final QuoteRepository quoteRepository;
//    private final PolicyService policyService;
//
//
//    @Override
//    public UnderwritingResponseDTO createCase(Long quoteId) {
//
//         Quote quote = quoteRepository.findById(quoteId)
//                .orElseThrow(() -> new RuntimeException("Product not found"));
//
//        UnderwritingCase uwCase = builder()
//                .quote(quote)
//                //.customerId(request.getCustomerId())
//                .decision(UnderwritingDecision.PENDING)
//                .decisionDate(LocalDateTime.now())
//                .build();
//
//        return mapToDTO(underwritingRepository.save(uwCase));
//    }
//
//    @Override
//    public
//    List<UnderwritingResponseDTO> getPendingCases() {
//
//        return underwritingRepository.findAll()
//                .stream()
//                .filter(c -> c.getDecision() == UnderwritingDecision.PENDING)
//                .map(this::mapToDTO)
//                .toList();
//    }
//
//    @Override
//    public UnderwritingResponseDTO getCase(Long caseId) {
//        UnderwritingCase uwCase=underwritingRepository.findById(caseId).orElseThrow(()->new RuntimeException("Case not found"));
//
//        return mapToDTO(uwCase);
//    }
//
//    @Override
//    public UnderwritingResponseDTO makeDecision(Long caseId,
//                                                UnderwritingDecisionDTO decisionDTO) {
//
//        UnderwritingCase uwCase = underwritingRepository.findById(caseId)
//                .orElseThrow(() -> new RuntimeException("Case not found"));
//        UnderwritingDecision decision=UnderwritingDecision.valueOf(decisionDTO.getDecision());
//        uwCase.setDecision(decision);
//        uwCase.setConditions(decisionDTO.getNotes());
//        Quote quote=uwCase.getQuote();
//        if(decision==UnderwritingDecision.APPROVE){
//            quote.setStatus(QuoteStatus.APPROVED);
//            policyService.issuePolicy(quote.getQuoteId());
//        }
//        else{
//            quote.setStatus(QuoteStatus.REJECTED);
//        }
//
//        if (uwCase.getDecision() != UnderwritingDecision.PENDING) {
//            throw new RuntimeException("Decision already made");
//        }
//
//        return mapToDTO(uwCase);
//    }
//    private UnderwritingResponseDTO mapToDTO(UnderwritingCase uwCase) {
//
//        return UnderwritingResponseDTO.builder()
//                .uwCaseId(uwCase.getUwCaseId())
//                .quoteId(uwCase.getQuote().getQuoteId())
//                //.status(UnderwritingDecision.APPROVE)
//                .decisionNotes(uwCase.getConditions())
//                .decisionDate(uwCase.getDecisionDate())
//                .build();
//    }
//}
package com.insuretrack.underwriting.service;

import com.insuretrack.billing.dto.InvoiceRequestDTO;
import com.insuretrack.billing.service.InvoiceService;
import com.insuretrack.common.enums.NotificationCategory;
import com.insuretrack.common.enums.QuoteStatus;
import com.insuretrack.common.enums.UnderwritingDecision;
import com.insuretrack.notification.service.NotificationService;
import com.insuretrack.policy.service.PolicyService;
import com.insuretrack.quote.entity.Quote;
import com.insuretrack.quote.repository.QuoteRepository;
import com.insuretrack.underwriting.dto.UnderwritingDecisionDTO;
import com.insuretrack.underwriting.dto.UnderwritingResponseDTO;
import com.insuretrack.underwriting.entity.UnderwritingCase;
import com.insuretrack.underwriting.repository.UnderwritingCaseRepository;
import com.insuretrack.user.entity.User;
import com.insuretrack.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.insuretrack.underwriting.entity.UnderwritingCase.*;

@Service
@AllArgsConstructor
@Transactional
public class UnderwritingServiceImpl implements UnderwritingService {

    private final UnderwritingCaseRepository underwritingRepository;
    private final UserRepository userRepository;
    private final QuoteRepository quoteRepository;
    private final PolicyService policyService;
    private final InvoiceService invoiceService;
    private final NotificationService notificationService;

    @Override
    public UnderwritingResponseDTO createCase(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));
        UnderwritingCase uwCase = builder()
                .quote(quote)
                .decision(UnderwritingDecision.PENDING)
                .decisionDate(LocalDateTime.now())
                .build();

        return mapToDTO(underwritingRepository.save(uwCase));
    }

    @Override
    public List<UnderwritingResponseDTO> getAllCases() {
        return underwritingRepository.findAll()
                .stream()
                .map(this::mapToDTO) // Maps every case to the DTO
                .toList();
    }

    @Override
    public List<UnderwritingResponseDTO> getPendingCases() {
        return underwritingRepository.findAll()
                .stream()
                .filter(c -> c.getDecision() == UnderwritingDecision.PENDING)
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public UnderwritingResponseDTO getCase(Long caseId) {
        UnderwritingCase uwCase = underwritingRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));
        return mapToDTO(uwCase);
    }

    @Override
    public UnderwritingResponseDTO makeDecision(Long caseId, UnderwritingDecisionDTO decisionDTO) {
        UnderwritingCase uwCase = underwritingRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        // 1. CHECK FIRST: Validation must happen before any state changes
        if (uwCase.getDecision() != UnderwritingDecision.PENDING) {
            throw new RuntimeException("Decision already made");
        }

        // 2. NOW UPDATE: Safe to proceed because we verified it's PENDING
        UnderwritingDecision decision = UnderwritingDecision.valueOf(decisionDTO.getDecision());
        uwCase.setDecision(decision);
        uwCase.setConditions(decisionDTO.getNotes());

        Quote quote = uwCase.getQuote();
        if (decision == UnderwritingDecision.APPROVE) {
            quote.setStatus(QuoteStatus.APPROVED);

            // 2. Issue the policy first to get a policyId
            var policyResponse = policyService.issuePolicy(quote.getQuoteId());

            // 3. Create the initial Invoice for the new policy
            InvoiceRequestDTO invoiceRequest = InvoiceRequestDTO.builder()
                    .amount(quote.getPremium()) // Assuming Quote has the amount
                    .dueDate(LocalDate.now().plusDays(30)) // Setting a default due date
                    .build();


            invoiceService.createInvoice(policyResponse.getPolicyId(), invoiceRequest);
        }
        else
        {
            // Mapping DECLINE to REJECTED based on your QuoteStatus enum
            quote.setStatus(QuoteStatus.REJECTED);
        }
        notificationService.createNotification(
                uwCase.getQuote().getCustomer().getCustomerId(),
                "Your Insurance Case #" + caseId + " has been " + decisionDTO.getDecision(),
                NotificationCategory.UNDERWRITING
        );

        // 3. SAVE changes
        return mapToDTO(underwritingRepository.save(uwCase));
    }
    private UnderwritingResponseDTO mapToDTO(UnderwritingCase uwCase) {
        return UnderwritingResponseDTO.builder()
                .uwCaseId(uwCase.getUwCaseId())
                .quoteId(uwCase.getQuote().getQuoteId())
                .decision(uwCase.getDecision().toString())
                // GETTING THE TYPE: Access the Product name via the Quote
                .riskScore(uwCase.getQuote().getInsuredObject().getRiskScore())
                .policyType(uwCase.getQuote().getProduct().getName())
                .customerName(uwCase.getQuote().getCustomer().getName())
                .coverageAmount(uwCase.getQuote().getPremium())
                .decisionDate(uwCase.getDecisionDate())
                .build();
    }
    @Override
    public Map<String, String> getUnderwriterProfile() {
        // 1. Get the email of the person currently logged in via the JWT/Session
        String currentUserEmail = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();

        // 2. Look up that person in the database
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User profile not found in database for: " + currentUserEmail));

        // 3. Map the real database values to the response
        Map<String, String> profile = new HashMap<>();
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().name());

        return profile;
    }

    @Override
    @Transactional
    public void updateProfile(Map<String, String> updates) {
        String currentUserEmail = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //System.out.println(updates);
        if(updates.containsKey("fullName")) {
            user.setName(updates.get("fullName"));
            //System.out.println(updates.get("name"));
        }

        userRepository.save(user);
    }

}