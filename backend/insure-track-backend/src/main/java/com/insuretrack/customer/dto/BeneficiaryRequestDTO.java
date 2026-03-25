package com.insuretrack.customer.dto;

import java.math.BigDecimal;

public record BeneficiaryRequestDTO(String name, String relationship, BigDecimal percentageShare) {
}
