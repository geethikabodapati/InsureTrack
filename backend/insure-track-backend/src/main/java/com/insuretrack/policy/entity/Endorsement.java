package com.insuretrack.policy.entity;

import com.insuretrack.common.enums.ChangeType;
import com.insuretrack.common.enums.EndorsementStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name="endorsement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Endorsement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name="endorsement_id")
    private Long enodrsementId;
    @ManyToOne
    @JoinColumn(name="policyId")
    private Policy policy;
    @Enumerated(EnumType.STRING)
    private ChangeType changeType;
    private LocalDate effectiveDate;
    private Double premiumDelta;
    @Enumerated(EnumType.STRING)
    private EndorsementStatus status;

}
