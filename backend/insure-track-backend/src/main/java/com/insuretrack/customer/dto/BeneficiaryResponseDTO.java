package com.insuretrack.customer.dto;

import java.math.BigDecimal;

public record BeneficiaryResponseDTO(
        Long beneficiaryId,
        String name,
        String relationship,
        BigDecimal percentageShare
) {}
