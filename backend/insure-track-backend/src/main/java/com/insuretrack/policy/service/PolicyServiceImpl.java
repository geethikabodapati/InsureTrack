package com.insuretrack.policy.service;

import com.insuretrack.common.enums.PolicyStatus;
import com.insuretrack.customer.entity.Customer;
import com.insuretrack.policy.dto.PolicyResponseDTO;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.repository.PolicyRepository;
import com.insuretrack.quote.entity.Quote;
import com.insuretrack.quote.repository.QuoteRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;


@Service
@AllArgsConstructor
@Transactional
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository policyRepository;
    private final QuoteRepository quoteRepository;
    @Override
    public PolicyResponseDTO issuePolicy(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));

        Policy policy = Policy.builder()
                .quote(quote)
                .policyNumber("POL-" + System.currentTimeMillis())
                .effectiveDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(1))
                .premium(quote.getPremium())
                .status(PolicyStatus.ACTIVE)
                .build();

        policyRepository.save(policy);
        return map(policy);
    }

    @Override
    public PolicyResponseDTO getPolicy(Long policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        return map(policy);
    }

    @Override
    public List<PolicyResponseDTO> getAllPolicies() {
        return policyRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }
    @Override
    public List<PolicyResponseDTO> getPoliciesByCustomerId(Long customerId) {
        List<Policy> policies = policyRepository.findByQuote_Customer_CustomerId(customerId);

        return policies.stream().map(this::map).toList();
    }

    private PolicyResponseDTO map(Policy policy) {
        String customerName = "N/A";
        Long quoteId = null;

        // Navigate the relationship: Policy -> Quote -> Customer
        if (policy.getQuote() != null) {
            quoteId = policy.getQuote().getQuoteId();

            Customer customer = policy.getQuote().getCustomer();
            if (customer != null && customer.getName() != null) {
                customerName = customer.getName();
            }
        }

        return PolicyResponseDTO.builder()
                .policyId(policy.getPolicyId())
                .policyNumber(policy.getPolicyNumber())
                .quoteId(quoteId)
                .effectiveDate(policy.getEffectiveDate())
                .expiryDate(policy.getExpiryDate())
                .premium(policy.getPremium())
                .status(policy.getStatus() != null ? policy.getStatus().name() : "UNKNOWN")
                .customerName(customerName) // Populated from Customer entity
                .build();
    }
}