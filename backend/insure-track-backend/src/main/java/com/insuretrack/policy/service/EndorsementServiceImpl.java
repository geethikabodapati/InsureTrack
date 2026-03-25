package com.insuretrack.policy.service;

import com.insuretrack.billing.dto.RefundRequestDTO;
import com.insuretrack.billing.entity.Payment;
import com.insuretrack.billing.repository.PaymentRepository;
import com.insuretrack.billing.service.RefundService;
import com.insuretrack.common.enums.ChangeType;
import com.insuretrack.common.enums.EndorsementStatus;
import com.insuretrack.policy.dto.EndorsementRequestDTO;
import com.insuretrack.policy.dto.EndorsementResponseDTO;
import com.insuretrack.policy.entity.Endorsement;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.repository.EndorsementRepository;
import com.insuretrack.policy.repository.PolicyRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class EndorsementServiceImpl implements EndorsementService {
    private final EndorsementRepository endorsementRepository;
    private final PolicyRepository policyRepository;
    private final RefundService refundService;
    private final PaymentRepository paymentRepository;

    @Override
    public EndorsementResponseDTO create(EndorsementRequestDTO requestDTO) {
        Policy policy = policyRepository.findById(requestDTO.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        Endorsement endorsement = Endorsement.builder()
                .policy(policy)
                .changeType(ChangeType.valueOf(requestDTO.getChangeType()))
                .premiumDelta(requestDTO.getPremiumDelta())
                .effectiveDate(LocalDate.now())
                .status(EndorsementStatus.DRAFT)
                .build();

        endorsementRepository.save(endorsement);
        return mapToDTO(endorsement);
    }

    @Override
    public List<EndorsementResponseDTO> getAllEndorsements() {
        return endorsementRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

//    @Override
//    public EndorsementResponseDTO approveEndorsement(Long endorsementId) {
//        // 1. Fetch Endorsement with its Policy
//        Endorsement endorsement = endorsementRepository.findById(endorsementId)
//                .orElseThrow(() -> new RuntimeException("Endorsement not found"));
//
//        // 2. Validate Endorsement Status
//        if (endorsement.getStatus() != EndorsementStatus.DRAFT) {
//            throw new RuntimeException("Only PENDING endorsements can be approved. Current status: " + endorsement.getStatus());
//        }
//
//        // 3. Validate Policy Status
//        Policy policy = endorsement.getPolicy();
//        if (policy.getStatus() == null || !"ACTIVE".equalsIgnoreCase(policy.getStatus().name())) {
//            throw new RuntimeException("Cannot approve endorsement for a policy that is not ACTIVE.");
//        }
//
//        // 4. Update Policy Premium
//        double currentPremium = (policy.getPremium() != null) ? policy.getPremium() : 0.0;
//        double deltaValue = (endorsement.getPremiumDelta() != null) ? endorsement.getPremiumDelta() : 0.0;
//
//        policy.setPremium(currentPremium + deltaValue);
//
//        // 5. Update Endorsement Status
//        endorsement.setStatus(EndorsementStatus.APPROVED);
//
//        // 6. Persist changes
//        policyRepository.save(policy);
//        endorsementRepository.save(endorsement);
//
//        return mapToDTO(endorsement);
//    }
@Override
@Transactional
public EndorsementResponseDTO approveEndorsement(Long endorsementId) {
    System.out.println(">>> DEBUG: Starting approval for Endorsement ID: " + endorsementId);

    Endorsement endorsement = endorsementRepository.findById(endorsementId)
            .orElseThrow(() -> new RuntimeException("Endorsement not found"));

    System.out.println(">>> DEBUG: Current Status: " + endorsement.getStatus());
    System.out.println(">>> DEBUG: Change Type from DB: " + endorsement.getChangeType());

    //if (endorsement.getStatus() != EndorsementStatus.PENDING) {
    if (endorsement.getStatus() != EndorsementStatus.DRAFT) {
        throw new RuntimeException("Only PENDING endorsements can be approved.");
    }

    Policy policy = endorsement.getPolicy();
    double currentPremium = (policy.getPremium() != null) ? policy.getPremium() : 0.0;
    double rawAmount = Math.abs(endorsement.getPremiumDelta());

    double finalDelta;
    boolean isRefundEligible = false;

    // Use name().toUpperCase() to ensure we match the Enum correctly
    String typeName = endorsement.getChangeType().name().toUpperCase();
    System.out.println(">>> DEBUG: Processing Type: " + typeName);

    if (typeName.equals("REMOVE_COVERAGE") || typeName.equals("LIMIT_CHANGE")) {
        finalDelta = -rawAmount; // Force Subtraction
        isRefundEligible = true;
        System.out.println(">>> DEBUG: Logic applied: SUBTRACTION (-" + rawAmount + ")");
    } else {
        finalDelta = rawAmount; // Addition
        System.out.println(">>> DEBUG: Logic applied: ADDITION (+" + rawAmount + ")");
    }

    // Update Policy
    double newPremium = currentPremium + finalDelta;
    policy.setPremium(newPremium);
    policyRepository.save(policy);
    System.out.println(">>> DEBUG: Policy Premium updated from " + currentPremium + " to " + newPremium);

    // Update Endorsement
    endorsement.setPremiumDelta(finalDelta);
    endorsement.setStatus(EndorsementStatus.APPROVED);

    if (isRefundEligible) {
        System.out.println(">>> DEBUG: Attempting to initiate refund...");
        Long paymentId = findLatestPaymentId(policy.getPolicyId());

        RefundRequestDTO refundRequest = new RefundRequestDTO();
        refundRequest.setAmount(rawAmount);
        refundRequest.setReason("Endorsement #" + endorsement.getEnodrsementId() + " - " + typeName);

        refundService.initiateRefund(paymentId, refundRequest);
        System.out.println(">>> DEBUG: Refund Service called successfully.");
    }

    Endorsement saved = endorsementRepository.save(endorsement);
    System.out.println(">>> DEBUG: Approval Complete.");
    return mapToDTO(saved);
}
    /**
     * Maps the Endorsement entity to DTO, including the Customer Name
     * by traversing: Endorsement -> Policy -> Quote -> Customer
     */
    private EndorsementResponseDTO mapToDTO(Endorsement endorsement) {
        String customerName = "N/A";

        // Null-safe navigation to get the customer name
        if (endorsement.getPolicy() != null &&
                endorsement.getPolicy().getQuote() != null &&
                endorsement.getPolicy().getQuote().getCustomer() != null) {

            customerName = endorsement.getPolicy().getQuote().getCustomer().getName();
        }

        return EndorsementResponseDTO.builder()
                .endorsementId(endorsement.getEnodrsementId())
                .policyId(endorsement.getPolicy().getPolicyId())
                .changeType(endorsement.getChangeType().name())
                .premiumDelta(endorsement.getPremiumDelta())
                .effectiveDate(endorsement.getEffectiveDate())
                .status(endorsement.getStatus().name())
                .customerName(customerName) // Populated the new field
                .build();
    }
    private Long findLatestPaymentId(Long policyId) {
        return paymentRepository.findPaymentsByPolicyId(policyId)
                .stream()
                .findFirst()
                .map(Payment::getPaymentId)
                .orElseThrow(() -> new RuntimeException("No payment found for this policy to refund against"));
    }
}