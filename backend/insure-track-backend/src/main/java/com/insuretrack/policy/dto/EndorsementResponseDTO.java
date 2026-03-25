package com.insuretrack.policy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EndorsementResponseDTO {
    private Long endorsementId;
    private Long policyId;
    private String changeType;
    private Double premiumDelta;
    private LocalDate effectiveDate;
    private String status;
    private String customerName;
}
