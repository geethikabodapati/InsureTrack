package com.insuretrack.claims.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReserveResponseDTO {

    private Long reserveId;
    private Long claimId;
    private Long policyId;
    private Double amount;
    private String status;
    private LocalDate createdDate;
}
