package com.insuretrack.underwriting.service;

import com.insuretrack.billing.dto.InvoiceRequestDTO;
import com.insuretrack.billing.service.InvoiceService;
import com.insuretrack.billing.service.PaymentService;
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
import com.insuretrack.user.repository.AuditLogRepository;
import com.insuretrack.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
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
    private final AuditLogRepository auditLogRepository;
    private final PaymentService paymentService;

    @Override
    public UnderwritingResponseDTO createCase(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));
        UnderwritingCase uwCase = builder()
                .quote(quote)
                .decision(UnderwritingDecision.PENDING)
                .decisionDate(LocalDateTime.now())
                .build();
        UnderwritingCase savedCase = underwritingRepository.save(uwCase);

        saveAuditLog("CREATE_CASE", "UNDERWRITING",
                "Created UW Case #" + savedCase.getUwCaseId() + " for Quote #" + quoteId);

        return mapToDTO(savedCase);
    }

    @Override
    public List<UnderwritingResponseDTO> getAllCases() {
        return underwritingRepository.findAll()
                .stream()
                .map(this::mapToDTO)
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

        if (uwCase.getDecision() != UnderwritingDecision.PENDING) {
            throw new RuntimeException("Decision already made");
        }

        UnderwritingDecision decision = UnderwritingDecision.valueOf(decisionDTO.getDecision());
        uwCase.setDecision(decision);
        uwCase.setConditions(decisionDTO.getNotes());

        Quote quote = uwCase.getQuote();

        if (decision == UnderwritingDecision.APPROVE) {
            quote.setStatus(QuoteStatus.APPROVED);

            // 1. Issue the policy
            var policyResponse = policyService.issuePolicy(quote.getQuoteId());

            // 2. Calculate MONTHLY amount
            Double annualPremium = quote.getPremium();
            Double monthlyAmount = (annualPremium != null) ? annualPremium / 12.0 : 0.0;

            // 3. Create initial Invoice
            InvoiceRequestDTO invoiceRequest = InvoiceRequestDTO.builder()
                    .amount(monthlyAmount)
                    .dueDate(LocalDate.now().plusDays(30))
                    .build();

            var invoiceResponse = invoiceService.createInvoice(policyResponse.getPolicyId(), invoiceRequest);
            paymentService.createPendingPayment(invoiceResponse.getInvoiceId(), monthlyAmount);

        } else {
            quote.setStatus(QuoteStatus.REJECTED);
        }

        // Fix: Fetch the correct User ID from the Customer entity to prevent User not found error
        Long userIdForNotification = uwCase.getQuote().getCustomer().getUser().getUserId();

        notificationService.createNotification(
                userIdForNotification,
                "Your Insurance Case #" + caseId + " has been " + decisionDTO.getDecision(),
                NotificationCategory.UNDERWRITING
        );

        UnderwritingCase updatedCase = underwritingRepository.save(uwCase);

        saveAuditLog("UW_DECISION", "UNDERWRITING",
                "Case #" + caseId + " " + decision + " for Customer ID: " + quote.getCustomer().getCustomerId());

        return mapToDTO(updatedCase);
    }

    private UnderwritingResponseDTO mapToDTO(UnderwritingCase uwCase) {
        return UnderwritingResponseDTO.builder()
                .uwCaseId(uwCase.getUwCaseId())
                .quoteId(uwCase.getQuote().getQuoteId())
                .decision(uwCase.getDecision().toString())
                .riskScore(uwCase.getQuote().getInsuredObject().getRiskScore())
                .policyType(uwCase.getQuote().getProduct().getName())
                .customerName(uwCase.getQuote().getCustomer().getName())
                .coverageAmount(uwCase.getQuote().getPremium())
                .decisionDate(uwCase.getDecisionDate())
                .build();
    }

    @Override
    public Map<String, String> getUnderwriterProfile() {
        String currentUserEmail = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User profile not found in database for: " + currentUserEmail));

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

        if(updates.containsKey("fullName")) {
            String oldName = user.getName();
            user.setName(updates.get("fullName"));
            saveAuditLog("UPDATE_PROFILE", "USER",
                    "Underwriter changed name from '" + oldName + "' to '" + user.getName() + "'");
        }

        userRepository.save(user);
    }

    private void saveAuditLog(String action, String resource, String metadata) {
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        User currentUser = null;
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        }

        auditLogRepository.save(com.insuretrack.user.entity.AuditLog.builder()
                .action(action)
                .resource(resource)
                .metadata(metadata)
                .timestamp(LocalDateTime.now())
                .user(currentUser)
                .build());
    }
}