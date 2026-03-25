package com.insuretrack.policy.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class PolicyResponseDTO {
    private Long policyId;
    private String policyNumber;
    private Long quoteId;
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private Double premium;
    private String status;
    private String customerName;
}
