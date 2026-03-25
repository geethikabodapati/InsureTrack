package com.insuretrack.claims.service;

import com.insuretrack.claims.dto.ClaimRequestDTO;
import com.insuretrack.claims.dto.ClaimResponseDTO;
import com.insuretrack.claims.entity.Claim;
import com.insuretrack.claims.repository.ClaimRepository;
import com.insuretrack.common.enums.ClaimStatus;
import com.insuretrack.notification.service.NotificationService;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.repository.PolicyRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final NotificationService notificationService;

    @Override
    public ClaimResponseDTO createClaim(ClaimRequestDTO dto) {

        Policy policy = policyRepository.findById(dto.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        Claim claim = Claim.builder()
                .policy(policy)
                .incidentDate(dto.getIncidentDate())
                .reportedDate(LocalDate.now())
                .claimType(dto.getClaimType())
                .description(dto.getDescription())
                .status(ClaimStatus.OPEN)
                .build();

        claimRepository.save(claim);
//        notificationService.createNotification(
//                policy.getQuote().getCustomer().getCustomerId(),
//                "Claim generated for Policy " + policy.getPolicyNumber(),
//                NotificationCategory.CLAIM);
//        notificationService.createNotification(
//                5L,
//                "New FNOL filed: " + claim.getClaimId() + ". Needs triage.",
//                NotificationCategory.ASSIGNMENT
//        );
        return mapToResponse(claim);
    }

    @Override
    public ClaimResponseDTO moveToReview(Long id) {
        Claim claim = getClaimEntity(id);
        validate(claim, ClaimStatus.OPEN);
        claim.setStatus(ClaimStatus.INVESTIGATING);
        return mapToResponse(claim);
    }

    @Override
    public ClaimResponseDTO approveClaim(Long id) {
        Claim claim = getClaimEntity(id);
        validate(claim, ClaimStatus.INVESTIGATING);
        claim.setStatus(ClaimStatus.ADJUDICATED);
        return mapToResponse(claim);
    }

    @Override
    public ClaimResponseDTO rejectClaim(Long id) {
        Claim claim = getClaimEntity(id);

        // ALLOW rejection if status is OPEN OR INVESTIGATING
        if (claim.getStatus() != ClaimStatus.OPEN && claim.getStatus() != ClaimStatus.INVESTIGATING) {
            throw new RuntimeException("Invalid status transition: Cannot reject claim in " + claim.getStatus() + " status");
        }

        claim.setStatus(ClaimStatus.DENIED);
        return mapToResponse(claim);
    }

    @Override
    public ClaimResponseDTO closeClaim(Long id) {
        Claim claim = getClaimEntity(id);
        validate(claim, ClaimStatus.SETTLED);
        claim.setStatus(ClaimStatus.CLOSED);
        return mapToResponse(claim);
    }

    @Override
    public ClaimResponseDTO getClaim(Long id) {
        return mapToResponse(getClaimEntity(id));
    }

    @Override
    public List<ClaimResponseDTO> getAllClaims() {
        return claimRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ClaimResponseDTO> getClaimsByStatus(String status) {
        ClaimStatus claimStatus = ClaimStatus.valueOf(status.toUpperCase());
        return claimRepository.findAll()
                .stream()
                .filter(c -> c.getStatus() == claimStatus)
                .map(this::mapToResponse)
                .toList();
    }


    private Claim getClaimEntity(Long id) {
        return claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
    }

    private void validate(Claim claim, ClaimStatus expected) {
        if (claim.getStatus() != expected)
            throw new RuntimeException("Invalid status transition");
    }
    @Override
    public List<ClaimResponseDTO> getClaimsByCustomerId(Long customerId) {
        List<Claim> claims = claimRepository.findByPolicy_Quote_Customer_CustomerId(customerId);
        return claims.stream().map(this::mapToResponse).toList();
    }
    private ClaimResponseDTO mapToResponse(Claim claim) {
        Policy policy=claim.getPolicy();
        return ClaimResponseDTO.builder()
                .claimId(claim.getClaimId())
                .policyId(policy != null ? policy.getPolicyId() : null)
                .policyNumber(policy != null ? policy.getPolicyNumber() : null)  // ← ADD
                .incidentDate(claim.getIncidentDate())
                .reportedDate(claim.getReportedDate())
                .claimType(claim.getClaimType())
                .description(claim.getDescription())
                .status(claim.getStatus() != null
                        ? claim.getStatus().name()
                        : null)
                .build();
    }
}