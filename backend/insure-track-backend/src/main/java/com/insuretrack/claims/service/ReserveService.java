package com.insuretrack.claims.service;

import com.insuretrack.claims.dto.ReserveRequestDTO;
import com.insuretrack.claims.dto.ReserveResponseDTO;

import java.util.List;

public interface ReserveService {
    ReserveResponseDTO createReserve(Long claimId, ReserveRequestDTO dto);
    List<ReserveResponseDTO> getReservesByPolicy(Long policyId);
    List<ReserveResponseDTO> getReservesByClaim(Long claimId);
}
