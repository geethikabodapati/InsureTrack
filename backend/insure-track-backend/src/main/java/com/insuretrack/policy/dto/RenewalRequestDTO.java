package com.insuretrack.policy.dto;

import lombok.Data;

@Data
public class RenewalRequestDTO {
    private Long policyId;
    private Double proposedPremium;

}
