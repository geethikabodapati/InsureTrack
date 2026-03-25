//package com.insuretrack.claims.repository;
//
//import com.insuretrack.claims.entity.Reserve;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//public interface ReserveRepository extends JpaRepository<Reserve,Long> {
//
//}
package com.insuretrack.claims.repository;

import com.insuretrack.claims.entity.Reserve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReserveRepository extends JpaRepository<Reserve, Long> {
    List<Reserve> findByClaimClaimId(Long claimId);
    // Sum of all active (non-released) reserves across ALL claims for a policy
    // Used to calculate how much of the policy premium is already reserved
    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Reserve r " +
            "WHERE r.claim.policy.policyId = :policyId " +
            "AND r.status != 'RELEASED'")
    Double sumActiveReservesByPolicyId(@Param("policyId") Long policyId);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Reserve r " +
            "JOIN r.claim c JOIN c.policy p WHERE p.policyId = :policyId")
    Double sumReservedByPolicy(@Param("policyId") Long policyId);

    @Query("SELECT r FROM Reserve r WHERE r.claim.policy.policyId = :policyId")
    List<Reserve> findByClaimPolicyId(@Param("policyId") Long policyId);

}