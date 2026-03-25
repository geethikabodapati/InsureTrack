package com.insuretrack.claims.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClaimResponseDTO {

    private Long claimId;
    private Long policyId;
    private String    policyNumber;
    private LocalDate incidentDate;
    private LocalDate reportedDate;
    private String claimType;
    private String description;
    private String status;
}
