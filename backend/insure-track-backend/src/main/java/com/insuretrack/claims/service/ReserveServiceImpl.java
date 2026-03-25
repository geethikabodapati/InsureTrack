package com.insuretrack.claims.service;

import com.insuretrack.claims.dto.ReserveRequestDTO;
import com.insuretrack.claims.dto.ReserveResponseDTO;
import com.insuretrack.claims.entity.Claim;
import com.insuretrack.claims.entity.Reserve;
import com.insuretrack.claims.repository.ClaimRepository;
import com.insuretrack.claims.repository.ReserveRepository;
import com.insuretrack.common.enums.ClaimStatus;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class ReserveServiceImpl implements ReserveService {

    private final ReserveRepository reserveRepository;
    private final ClaimRepository claimRepository;

    @Override
    public ReserveResponseDTO createReserve(Long claimId, ReserveRequestDTO dto) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        // Logic: Allowing reserve creation in INVESTIGATING or ADJUDICATED
        Reserve reserve = Reserve.builder()
                .claim(claim)
                .amount(dto.getAmount())
                .setDate(LocalDate.now())
                .status("OPEN") // Start as OPEN per your requirement
                .build();

        reserveRepository.save(reserve);
        if (claim.getStatus() == ClaimStatus.ADJUDICATED) {
            claim.setStatus(ClaimStatus.SETTLED);
            claimRepository.save(claim);
        }
        return mapToResponse(reserve);
    }
    @Override
    public List<ReserveResponseDTO> getReservesByPolicy(Long policyId) {
        // Correct Path: r.claim.policy.policyId
        return reserveRepository.findByClaimPolicyId(policyId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ReserveResponseDTO> getReservesByClaim(Long claimId) {
        // FIX: use proper repository query instead of findAll() + filter
        return reserveRepository.findByClaimClaimId(claimId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ReserveResponseDTO mapToResponse(Reserve reserve) {
        return ReserveResponseDTO.builder()
                .reserveId(reserve.getReserveId())
                .claimId(reserve.getClaim().getClaimId())
                .policyId(reserve.getClaim().getPolicy().getPolicyId())
                .amount(reserve.getAmount())
                .status(reserve.getStatus())
                .createdDate(reserve.getSetDate())
                .build();
    }
}