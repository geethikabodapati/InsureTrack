package com.insuretrack.policy.repository;

import com.insuretrack.policy.entity.Cancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CancellationRepository extends JpaRepository<Cancellation,Long> {
    List<Cancellation> findByPolicyPolicyId(Long policyId);
    // This allows us to find the cancellation record using the Policy ID from the refund reason
    //List<Cancellation> findByPolicy_PolicyId(Long policyId);
    @Query("SELECT c FROM Cancellation c " +
            "JOIN c.policy p " +
            "JOIN p.quote q " +
            "JOIN q.customer cust")
    List<Cancellation> findAllWithCustomerDetails();
}
