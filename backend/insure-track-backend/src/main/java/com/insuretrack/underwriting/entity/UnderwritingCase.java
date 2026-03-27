package com.insuretrack.underwriting.entity;

import com.insuretrack.common.enums.UnderwritingDecision;
import com.insuretrack.quote.entity.Quote;
import com.insuretrack.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="underwritingcase")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnderwritingCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uwCaseId;
    @ManyToOne
    @JoinColumn(name="quoteId")
    private Quote quote;
    @ManyToOne
    @JoinColumn(name = "underwriter_id")
    private User underwriter;

    private String riskAssessment;
    @Enumerated(EnumType.STRING)
    private UnderwritingDecision decision;
    private String conditions;
    private LocalDateTime decisionDate;
}
