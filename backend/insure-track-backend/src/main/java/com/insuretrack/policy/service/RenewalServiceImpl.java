package com.insuretrack.policy.service;

import com.insuretrack.common.enums.RenewalStatus;
import com.insuretrack.policy.dto.RenewalRequestDTO;
import com.insuretrack.policy.dto.RenewalResponseDTO;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.entity.Renewal;
import com.insuretrack.policy.repository.PolicyRepository;
import com.insuretrack.policy.repository.RenewalRepository;
import com.insuretrack.product.service.RatingRuleService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class RenewalServiceImpl implements RenewalService {

    private final RenewalRepository renewalRepository;
    private final PolicyRepository policyRepository;
    private final RatingRuleService ratingRuleService;

    @Override
    public RenewalResponseDTO createOffer(RenewalRequestDTO request) {
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        Renewal renewal = Renewal.builder()
                .policy(policy)
                .proposedPremium(request.getProposedPremium()+10000)
                .offerDate(LocalDate.now())
                .status(RenewalStatus.OFFERED)
                .build();

        renewalRepository.save(renewal);
        return mapToDTO(renewal);
    }

    @Override
    public List<RenewalResponseDTO> getByPolicy(Long policyId) {
        return renewalRepository.findByPolicyPolicyId(policyId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RenewalResponseDTO> getAllRenewals() {
        return renewalRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    @Override
    public void updateRenewalStatus(Long renewalId, String status) {
        Renewal renewal = renewalRepository.findById(renewalId)
                .orElseThrow(() -> new RuntimeException("Renewal record not found with ID: " + renewalId));

        // Convert string from frontend to Enum
        renewal.setStatus(RenewalStatus.valueOf(status.toUpperCase()));
        renewalRepository.save(renewal);
    }

    private RenewalResponseDTO mapToDTO(Renewal renewal) {
        Policy policy = renewal.getPolicy();
        String customerName = "N/A";
        String productName = "N/A";

        if (policy != null && policy.getQuote() != null) {
            if (policy.getQuote().getCustomer() != null) {
                customerName = policy.getQuote().getCustomer().getName();
            }
            if (policy.getQuote().getProduct() != null) {
                productName = policy.getQuote().getProduct().getName();
            }
        }

        return RenewalResponseDTO.builder()
                .renewalId(renewal.getRenewalId())
                .policyId(policy != null ? policy.getPolicyId() : null)
                .policyNumber(policy != null ? policy.getPolicyNumber() : "N/A")
                .customerName(customerName)
                .productName(productName)
                .currentPremium(policy != null ? policy.getPremium() : 0.0)
                .proposedPremium(renewal.getProposedPremium())
                .offerDate(renewal.getOfferDate())
                .status(renewal.getStatus().name())
                .build();
    }
}