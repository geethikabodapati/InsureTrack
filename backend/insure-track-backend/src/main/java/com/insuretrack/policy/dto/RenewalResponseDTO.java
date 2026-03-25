package com.insuretrack.policy.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class RenewalResponseDTO {
    private Long renewalId;
    private Long policyId;
    private Double proposedPremium;
    private LocalDate offerDate;
    private String status;
    private String policyNumber;    // Added
    private String customerName;    // Added
    private String productName;     // Added (e.g., CAR, BIKE)
    private Double currentPremium;  // Added
}
