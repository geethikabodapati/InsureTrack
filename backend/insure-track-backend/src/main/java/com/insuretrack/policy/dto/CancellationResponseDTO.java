package com.insuretrack.policy.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class CancellationResponseDTO {
    private Long cancellationId;
    private Long policyId;
    private String policyNumber; // Added to fix builder error
    private String customerName; // Added to fix builder error
    private String reason;
    private LocalDate effectiveDate;
    private Double refundAmount;
    private String status;
}