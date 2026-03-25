package com.insuretrack.customer.dto;

import com.insuretrack.common.enums.Status;

public record InsuredObjectResponseDTO(
        Long objectId,
        String objectType,
        String detailsJson,
        Double valuation,
        Double riskScore,
        Status status
) {}
