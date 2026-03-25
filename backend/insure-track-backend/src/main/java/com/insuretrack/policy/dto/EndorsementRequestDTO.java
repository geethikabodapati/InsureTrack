package com.insuretrack.policy.dto;

import lombok.Data;

@Data
public class EndorsementRequestDTO {
    private Long policyId;
    private String changeType;
    private Double premiumDelta;

}
