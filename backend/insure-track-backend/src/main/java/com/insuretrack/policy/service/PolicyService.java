package com.insuretrack.policy.service;

import com.insuretrack.policy.dto.PolicyResponseDTO;
import com.insuretrack.product.dto.DashboardStatsDTO;

import java.util.List;

public interface PolicyService {
    PolicyResponseDTO issuePolicy(Long quoteId);
    PolicyResponseDTO getPolicy(Long policyId);
    List<PolicyResponseDTO> getAllPolicies();

    List<PolicyResponseDTO> getPoliciesByCustomerId(Long customerId);
}
