package com.insuretrack.policy.service;

import com.insuretrack.policy.dto.RenewalRequestDTO;
import com.insuretrack.policy.dto.RenewalResponseDTO;
import java.util.List;

public interface RenewalService {
    RenewalResponseDTO createOffer(RenewalRequestDTO requestDTO);
    List<RenewalResponseDTO> getByPolicy(Long policyId);
    // Added for Agent Dashboard
    List<RenewalResponseDTO> getAllRenewals();
    void updateRenewalStatus(Long renewalId, String status);
}