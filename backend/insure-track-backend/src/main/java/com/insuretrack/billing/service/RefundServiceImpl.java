package com.insuretrack.billing.service;

import com.insuretrack.billing.dto.RefundRequestDTO;
import com.insuretrack.billing.dto.RefundResponseDTO;
import com.insuretrack.billing.entity.Payment;
import com.insuretrack.billing.entity.Refund;
import com.insuretrack.billing.repository.PaymentRepository;
import com.insuretrack.billing.repository.RefundRepository;
import com.insuretrack.common.enums.CancellationStatus;
import com.insuretrack.common.enums.PaymentStatus;
import com.insuretrack.common.enums.RefundStatus;
import com.insuretrack.policy.entity.Cancellation;
import com.insuretrack.policy.entity.Endorsement;
import com.insuretrack.policy.repository.CancellationRepository;
import com.insuretrack.policy.repository.EndorsementRepository;
import com.insuretrack.common.enums.EndorsementStatus;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class RefundServiceImpl implements RefundService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final EndorsementRepository endorsementRepository;
    private final CancellationRepository cancellationRepository;

    @Override
    @Transactional
    public RefundResponseDTO initiateRefund(Long paymentId, RefundRequestDTO dto) {
        // 1. Find the original payment
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // 2. Validations
        if (!payment.getStatus().equals(PaymentStatus.COMPLETED)) {
            throw new RuntimeException("Refund allowed only for completed payments");
        }
        if (dto.getAmount() == null || dto.getAmount() <= 0) {
            throw new RuntimeException("Refund amount must be positive.");
        }
        if (dto.getAmount() > payment.getAmount()) {
            throw new RuntimeException("Refund exceeds payment amount");
        }
        if (dto.getReason() == null || dto.getReason().trim().isEmpty()) {
            throw new RuntimeException("Refund reason cannot be empty.");
        }

        LocalDate processedDate = LocalDate.now();
        if (processedDate.isBefore(payment.getPaidDate())) {
            throw new RuntimeException("Refund processed date must be after payment date.");
        }

        // 3. Build and Save Refund Entity
        Refund refund = Refund.builder()
                .payment(payment)
                .amount(dto.getAmount())
                .reason(dto.getReason())
                .processedDate(processedDate)
                .status(RefundStatus.INITIATED)
                .build();

        Refund savedRefund = refundRepository.save(refund);
        return mapToResponse(savedRefund);
    }

    @Override
    @Transactional
    public RefundResponseDTO completeRefund(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund record not found"));

        if (RefundStatus.COMPLETED.equals(refund.getStatus())) {
            return mapToResponse(refund); // Already done
        }

        // 1. Update Refund
        refund.setStatus(RefundStatus.COMPLETED);
        refund.setProcessedDate(LocalDate.now());

        // 2. Sync with Source
        String reason = refund.getReason();
        if (reason != null) {
            if (reason.contains("Endorsement #")) {
                updateEndorsementToApplied(reason);
            } else if (reason.contains("Cancellation #")) {
                updateCancellationToProcessed(reason);
            }
        }

        Refund savedRefund = refundRepository.save(refund);
        return mapToResponse(savedRefund);
    }


//    private void updateCancellationToProcessed(String reason) {
//        try {
//            // 1. Extract the ID (Assumes format "Cancellation #12")
//            String idStr = reason.split("#")[1].trim();
//            Long cancellationId = Long.parseLong(idStr);
//
//            // 2. Find the SPECIFIC cancellation record by its OWN ID
//            cancellationRepository.findById(cancellationId).ifPresent(c -> {
//                // Change status to COMPLETED (or PROCESSED depending on your Enum)
//                c.setStatus(CancellationStatus.PROCESSED);
//                cancellationRepository.save(c);
//
//                // 3. Optional: If you want to log it
//                System.out.println(">>> SYNC SUCCESS: Cancellation #" + cancellationId + " is now COMPLETED");
//            });
//        } catch (Exception e) {
//            System.err.println(">>> SYNC FAILED: Could not update cancellation status. Reason: " + e.getMessage());
//        }
//    }
    // added change ***************************
    private void updateCancellationToProcessed(String reason) {
        try {
            // reason is "Cancellation #12"
            String idStr = reason.split("#")[1].trim();
            Long cancellationId = Long.parseLong(idStr);

            cancellationRepository.findById(cancellationId).ifPresent(c -> {
                c.setStatus(CancellationStatus.PROCESSED); // Now moving to PROCESSED
                cancellationRepository.save(c);
                System.out.println("SYNC SUCCESS: Cancellation #" + cancellationId + " is now PROCESSED");
            });
        } catch (Exception e) {
            System.err.println("Cancellation sync failed: " + e.getMessage());
        }
    }

    private void updateEndorsementToApplied(String reason) {
        try {
            // 1. Extract the ID from "Endorsement #4 - REMOVE_COVERAGE"
            // We split by '#' and then take the first number before the space
            String idStr = reason.split("#")[1].split(" ")[0].trim();
            Long endorsementId = Long.parseLong(idStr);

            // 2. USE findById! You want to update the SPECIFIC endorsement, not all for the policy.
            endorsementRepository.findById(endorsementId).ifPresent(endo -> {
                endo.setStatus(EndorsementStatus.APPLIED);
                endorsementRepository.save(endo);
                endorsementRepository.flush(); // Force the write to MySQL
                System.out.println(">>> SYNC SUCCESS: Endorsement #" + endorsementId + " is now APPLIED");
            });

        } catch (Exception e) {
            System.err.println(">>> SYNC FAILED for Endorsement: " + e.getMessage());
        }
    }

    @Override
    public List<RefundResponseDTO> getAllRefundsWithCustomer() {
        return refundRepository.findAllRefundsWithCustomer();
    }

    private RefundResponseDTO mapToResponse(Refund refund) {
        String reason = refund.getReason() != null ? refund.getReason() : "";

        // Determine Origin Type for Frontend Display
        String originType = "General";
        if (reason.contains("Cancellation")) originType = "Cancellation";
        else if (reason.contains("Endorsement")) originType = "Endorsement";

        String cName = (refund.getPayment() != null &&
                refund.getPayment().getInvoice() != null &&
                refund.getPayment().getInvoice().getPolicy() != null &&
                refund.getPayment().getInvoice().getPolicy().getQuote() != null)
                ? refund.getPayment().getInvoice().getPolicy().getQuote().getCustomer().getName()
                : "Unknown Customer";

        return RefundResponseDTO.builder()
                .refundId(refund.getRefundId())
                .paymentId(refund.getPayment().getPaymentId())
                .amount(refund.getAmount())
                .processedDate(refund.getProcessedDate())
                .reason(reason)
                .status(refund.getStatus())
                .customerName(cName)
                .originType(originType) // Ensure this field exists in your DTO
                .build();
    }

    // Legacy support for older controller calls if needed
    @Transactional
    public void disburseRefund(Long refundId) {
        this.completeRefund(refundId);
    }

}