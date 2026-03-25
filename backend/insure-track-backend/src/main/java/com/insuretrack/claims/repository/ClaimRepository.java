package com.insuretrack.claims.repository;

import com.insuretrack.claims.entity.Claim;
import com.insuretrack.claims.entity.ClaimAssignment;
import com.insuretrack.product.dto.DashboardStatsDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

    Optional<Claim> findByClaimId(Long claimId);
    List<Claim> findByPolicy_Quote_Customer_CustomerId(Long customerId);
    List<Claim> findByPolicyPolicyId(Long policyId);

}