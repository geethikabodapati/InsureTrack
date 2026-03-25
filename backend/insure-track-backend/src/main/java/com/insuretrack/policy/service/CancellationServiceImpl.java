package com.insuretrack.policy.service;

import com.insuretrack.billing.dto.RefundRequestDTO;
import com.insuretrack.billing.repository.PaymentRepository;
import com.insuretrack.billing.service.RefundService;
import com.insuretrack.common.enums.CancellationStatus;
import com.insuretrack.common.enums.PolicyStatus;
import com.insuretrack.policy.dto.CancellationRequestDTO;
import com.insuretrack.policy.dto.CancellationResponseDTO;
import com.insuretrack.policy.entity.Cancellation;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.repository.CancellationRepository;
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
public class CancellationServiceImpl implements CancellationService {

    private final CancellationRepository cancellationRepository;
    private final PolicyRepository policyRepository;
    private final PaymentRepository paymentRepository;
    private final RefundService refundService;

    @Override
    public CancellationResponseDTO createRequest(CancellationRequestDTO request) {
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        Cancellation cancellation = Cancellation.builder()
                .policy(policy)
                .reason(request.getReason())
                .effectiveDate(LocalDate.now())
                .status(CancellationStatus.REQUESTED) // Changed from PENDING to REQUESTED
                .refundAmount(0.0)
                .build();

        cancellationRepository.save(cancellation);
        return mapToDTO(cancellation);
    }

    @Override
    @Transactional
    public CancellationResponseDTO approveCancellation(Long cancellationId) {
        Cancellation cancellation = cancellationRepository.findById(cancellationId)
                .orElseThrow(() -> new RuntimeException("Cancellation request not found"));

        if (cancellation.getStatus() != CancellationStatus.REQUESTED) {
            throw new RuntimeException("Only REQUESTED cancellations can be approved.");
        }

        // 1. Update Policy
        Policy policy = cancellation.getPolicy();
        policy.setStatus(PolicyStatus.CANCELLED);
        policyRepository.save(policy);

        // 2. Update Cancellation Status
        cancellation.setStatus(CancellationStatus.APPROVED);
        // Ensure refund amount is calculated if it wasn't already
        if(cancellation.getRefundAmount() <= 0) {
            cancellation.setRefundAmount(calculateProRata(policy));
        }
        cancellationRepository.save(cancellation);

        // 3. Trigger Refund in Billing Module
        triggerRefund(cancellation, policy);

        return mapToDTO(cancellation);
    }

    private void triggerRefund(Cancellation cancellation, Policy policy) {
        try {
            // Find the successful payment to refund against
            var payments = paymentRepository.findByInvoice_Policy_PolicyId(policy.getPolicyId());
            var latestPayment = payments.stream()
                    .filter(p -> "COMPLETED".equals(p.getStatus().name()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No completed payment found to refund."));

            RefundRequestDTO refundRequest = new RefundRequestDTO();
            // Ensure we don't refund more than what was paid
            double finalRefundAmount = Math.min(cancellation.getRefundAmount(), latestPayment.getAmount());

            refundRequest.setAmount(finalRefundAmount);
            // CRITICAL: Format must match what RefundServiceImpl.completeRefund() expects
            refundRequest.setReason("Cancellation #" + cancellation.getCancellationId());

            refundService.initiateRefund(latestPayment.getPaymentId(), refundRequest);
            System.out.println("Refund initiated for Cancellation #" + cancellation.getCancellationId());

        } catch (Exception e) {
            // Log the error but don't fail the whole cancellation approval
            System.err.println("CRITICAL: Refund trigger failed: " + e.getMessage());
        }
    }

    @Override
    public List<CancellationResponseDTO> getAllCancellations() {
        return cancellationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CancellationResponseDTO> getByPolicy(Long policyId) {
        return cancellationRepository.findByPolicyPolicyId(policyId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CancellationResponseDTO cancel(CancellationRequestDTO request) {
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        double refundAmount = calculateProRata(policy);

        // STAGE 1: Only Create the Request. DO NOT cancel the policy yet.
        Cancellation cancellation = Cancellation.builder()
                .policy(policy)
                .reason(request.getReason())
                .effectiveDate(LocalDate.now())
                .refundAmount(refundAmount)
                .status(CancellationStatus.REQUESTED) // Set to REQUESTED
                .build();

        return mapToDTO(cancellationRepository.save(cancellation));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(noRollbackFor = RuntimeException.class)
    public CancellationResponseDTO approve_Cancellation(Long cancellationId) {
        Cancellation cancellation = cancellationRepository.findById(cancellationId)
                .orElseThrow(() -> new RuntimeException("Cancellation request not found"));

        if (cancellation.getStatus() != CancellationStatus.REQUESTED) {
            throw new RuntimeException("Only REQUESTED cancellations can be approved.");
        }

        // STAGE 2: Officially Cancel the Policy
        Policy policy = cancellation.getPolicy();
        policy.setStatus(PolicyStatus.CANCELLED);
        policyRepository.save(policy);

        // Update Status to APPROVED
        cancellation.setStatus(CancellationStatus.APPROVED);
        if(cancellation.getRefundAmount() <= 0) {
            cancellation.setRefundAmount(calculateProRata(policy));
        }
        cancellationRepository.save(cancellation);

        // STAGE 3: Trigger Refund
        try {
            var payments = paymentRepository.findByInvoice_Policy_PolicyId(policy.getPolicyId());
            var latestPayment = payments.stream()
                    .filter(p -> "COMPLETED".equals(p.getStatus().name()))
                    //.filter(p -> "PROCESSED".equals(p.getStatus().name()))
                    .findFirst().orElse(null);

//            if (latestPayment != null) {
                RefundRequestDTO refundRequest = new RefundRequestDTO();
                double finalRefundAmount = Math.min(cancellation.getRefundAmount(), latestPayment.getAmount());

                refundRequest.setAmount(finalRefundAmount);
                // IMPORTANT: Reason must include ID for RefundService to find it later
                refundRequest.setReason("Cancellation #" + cancellation.getCancellationId());

                refundService.initiateRefund(latestPayment.getPaymentId(), refundRequest);
            //}
        } catch (Exception e) {
            System.err.println("Refund trigger failed: " + e.getMessage());
        }

        return mapToDTO(cancellation);
    }
//    private CancellationResponseDTO mapToDTO(Cancellation cancellation) {
//        String name = "N/A";
//        if (cancellation.getPolicy() != null &&
//                cancellation.getPolicy().getQuote() != null &&
//                cancellation.getPolicy().getQuote().getCustomer() != null) {
//            name = cancellation.getPolicy().getQuote().getCustomer().getName();
//        }
//
//        return CancellationResponseDTO.builder()
//                .cancellationId(cancellation.getCancellationId())
//                .policyId(cancellation.getPolicy().getPolicyId())
//                .customerName(name)
//                .reason(cancellation.getReason())
//                .refundAmount(cancellation.getRefundAmount())
//                .status(cancellation.getStatus() != null ? cancellation.getStatus().name() : "PENDING")
//                .effectiveDate(cancellation.getEffectiveDate())
//                .build();
//    }

    @Override
    public List<CancellationResponseDTO> getAllCancellationsForDashboard() {
        return cancellationRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    private double calculateProRata(Policy policy) {
        LocalDate today = LocalDate.now();
        LocalDate start = policy.getEffectiveDate();
        LocalDate end = policy.getExpiryDate();

        if (today.isAfter(end)) return 0.0;
        if (today.isBefore(start)) return policy.getPremium();

        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(start, end);
        long remainingDays = java.time.temporal.ChronoUnit.DAYS.between(today, end);

        double calculatedRefund = ( (double) remainingDays / totalDays ) * policy.getPremium();
        return Math.round(calculatedRefund * 100.0) / 100.0;
    }

    private CancellationResponseDTO mapToDTO(Cancellation c) {
        String customerName = "N/A";
        String policyNum = "N/A";

        if (c.getPolicy() != null) {
            policyNum = c.getPolicy().getPolicyNumber();
            if (c.getPolicy().getQuote() != null && c.getPolicy().getQuote().getCustomer() != null) {
                customerName = c.getPolicy().getQuote().getCustomer().getName();
            }
        }

        return CancellationResponseDTO.builder()
                .cancellationId(c.getCancellationId())
                .policyId(c.getPolicy() != null ? c.getPolicy().getPolicyId() : null)
                .policyNumber(policyNum)
                .customerName(customerName)
                .reason(c.getReason())
                .effectiveDate(c.getEffectiveDate())
                .refundAmount(c.getRefundAmount())
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .build();
    }
}