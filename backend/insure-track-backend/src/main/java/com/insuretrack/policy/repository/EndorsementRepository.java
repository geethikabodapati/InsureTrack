package com.insuretrack.policy.repository;

import com.insuretrack.policy.entity.Endorsement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EndorsementRepository extends JpaRepository<Endorsement,Long> {
    //List<Endorsement> findByPolicyPolicyId(Long policyId);

    List<Endorsement> findByPolicy_PolicyId(Long policyId);
}
