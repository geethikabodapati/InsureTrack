package com.insuretrack.claims.service;

import com.insuretrack.claims.dto.AssignmentRequestDTO;
import com.insuretrack.claims.dto.AssignmentResponseDTO;
import com.insuretrack.claims.entity.Claim;
import com.insuretrack.claims.entity.ClaimAssignment;
import com.insuretrack.claims.repository.ClaimAssignmentRepository;
import com.insuretrack.claims.repository.ClaimRepository;
import com.insuretrack.common.enums.ClaimStatus;
import com.insuretrack.common.enums.NotificationCategory;
import com.insuretrack.notification.service.NotificationService;
import com.insuretrack.user.entity.User;
import com.insuretrack.user.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@AllArgsConstructor
@Transactional
public class AssignmentServiceImpl implements AssignmentService {

    private final ClaimRepository claimRepository;
    private final ClaimAssignmentRepository assignmentRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Override
    public AssignmentResponseDTO assignAdjuster(Long claimId, AssignmentRequestDTO dto) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        if (claim.getStatus() != ClaimStatus.INVESTIGATING)
            throw new RuntimeException("Assignment allowed only in INVESTIGATING stage");

        assignmentRepository.findByClaimClaimId(claimId)
                .ifPresent(a -> { throw new RuntimeException("Claim already assigned"); });

        // FIX: Fetch actual adjuster User from UserRepository
        User adjuster = userRepository.findById(dto.getAdjusterId())
                .orElseThrow(() -> new RuntimeException("Adjuster not found"));

        ClaimAssignment assignment = ClaimAssignment.builder()
                .claim(claim)
                .adjuster(adjuster)
                .priority(dto.getPriority())
                .assignmentDate(LocalDate.now())
                .build();

        ClaimAssignment saved = assignmentRepository.save(assignment);
//        notificationService.createNotification(
//                dto.getAdjusterId(),
//                "Claim " + claimId + " has been assigned to you with " + dto.getPriority() + " priority.",
//                NotificationCategory.ASSIGNMENT
//        );

        return AssignmentResponseDTO.builder()
                .assignmentId(saved.getAssignmentId())
                .claimId(claimId)
                .adjusterId(adjuster.getUserId())  // FIX: was returning assignmentId
                .priority(saved.getPriority())
                .assignmentDate(saved.getAssignmentDate())
                .build();
    }

    @Override
    public AssignmentResponseDTO getByClaimId(Long claimId) {
        ClaimAssignment assignment = assignmentRepository.findByClaimClaimId(claimId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        return mapToResponse(assignment);
    }

    private AssignmentResponseDTO mapToResponse(ClaimAssignment assignment) {
        return AssignmentResponseDTO.builder()
                .assignmentId(assignment.getAssignmentId())
                .claimId(assignment.getClaim().getClaimId())
                .adjusterId(assignment.getAdjuster().getUserId()) // FIX: was returning assignmentId
                .priority(assignment.getPriority())
                .assignmentDate(assignment.getAssignmentDate())
                .build();
    }
}

