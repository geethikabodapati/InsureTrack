package com.insuretrack.customer.dto;

import com.insuretrack.common.enums.Segment;
import com.insuretrack.common.enums.Status;

import java.time.LocalDate;

public record CustomerResponseDTO(Long customerId, String name, LocalDate dob, String contactInfo, Segment segment,
                                  Status status,Long userId) {
}
