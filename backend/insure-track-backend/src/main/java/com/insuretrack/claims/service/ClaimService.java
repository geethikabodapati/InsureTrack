package com.insuretrack.claims.service;

import com.insuretrack.claims.dto.ClaimRequestDTO;
import com.insuretrack.claims.dto.ClaimResponseDTO;

import java.util.List;

public interface ClaimService {

    ClaimResponseDTO createClaim(ClaimRequestDTO dto);

    ClaimResponseDTO getClaim(Long claimId);

    ClaimResponseDTO moveToReview(Long claimId);

    ClaimResponseDTO approveClaim(Long claimId);

    ClaimResponseDTO rejectClaim(Long claimId);

    ClaimResponseDTO closeClaim(Long claimId);
    List<ClaimResponseDTO> getAllClaims();
    List<ClaimResponseDTO> getClaimsByStatus(String status);

    List<ClaimResponseDTO> getClaimsByCustomerId(Long customerId);
}