package com.insuretrack.claims.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class PolicyInfoDTO {
    private Long       policyId;
    private String     policyNumber;
    private LocalDate  effectiveDate;
    private LocalDate  expiryDate;
    private Double     premium;               // full policy amount
    private String     status;
    private String     productName;

    // ── Balance tracking across ALL claims on this policy ────────────────────
    private Double totalReservedOnPolicy;     // sum of all reserves
    private Double totalSettledOnPolicy;      // sum of all settlements paid
    private Double remainingBalance;          // premium - settled - reserved
}
