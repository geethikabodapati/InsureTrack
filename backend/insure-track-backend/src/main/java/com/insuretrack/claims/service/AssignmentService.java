package com.insuretrack.claims.service;

import com.insuretrack.claims.dto.AssignmentRequestDTO;
import com.insuretrack.claims.dto.AssignmentResponseDTO;

public interface AssignmentService {
    AssignmentResponseDTO assignAdjuster(
            Long claimId,
            AssignmentRequestDTO dto);
    AssignmentResponseDTO getByClaimId(Long claimId);
}