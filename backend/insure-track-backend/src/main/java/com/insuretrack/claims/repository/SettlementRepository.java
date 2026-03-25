package com.insuretrack.claims.repository;

import com.insuretrack.claims.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SettlementRepository extends JpaRepository<Settlement,Long> {
    Optional<Settlement> findByClaimClaimId(Long claimId);
    @Query("SELECT COALESCE(SUM(s.settlementAmount), 0) FROM Settlement s " +
            "JOIN s.claim c JOIN c.policy p WHERE p.policyId = :policyId")
    Double sumSettledByPolicy(@Param("policyId") Long policyId);
}
