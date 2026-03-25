package com.insuretrack.billing.dto;

import com.insuretrack.common.enums.RefundStatus;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor // This provides the constructor Hibernate is looking for
@Builder
public class RefundResponseDTO {
    private Long refundId;
    private Long paymentId;
    private Double amount;
    private LocalDate processedDate;
    private String reason;
    private RefundStatus status;
    private String customerName;

    // This field isn't in the JPQL "new" constructor,
    // we set it manually in the Service mapToResponse method.
    private String originType;

    // Explicit constructor for the JPQL Query (7 parameters)
    public RefundResponseDTO(Long refundId, Long paymentId, Double amount,
                             LocalDate processedDate, String reason,
                             RefundStatus status, String customerName) {
        this.refundId = refundId;
        this.paymentId = paymentId;
        this.amount = amount;
        this.processedDate = processedDate;
        this.reason = reason;
        this.status = status;
        this.customerName = customerName;
    }
}