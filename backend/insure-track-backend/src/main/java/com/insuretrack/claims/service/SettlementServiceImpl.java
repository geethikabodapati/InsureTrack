package com.insuretrack.claims.service;

import com.insuretrack.claims.dto.SettlementRequestDTO;
import com.insuretrack.claims.dto.SettlementResponseDTO;
import com.insuretrack.claims.entity.Claim;
import com.insuretrack.claims.entity.Reserve;
import com.insuretrack.claims.entity.Settlement;
import com.insuretrack.claims.repository.ClaimRepository;
import com.insuretrack.claims.repository.ReserveRepository;
import com.insuretrack.claims.repository.SettlementRepository;
import com.insuretrack.common.enums.ClaimStatus;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class SettlementServiceImpl implements SettlementService {

    private final SettlementRepository settlementRepository;
    private final ClaimRepository claimRepository;
    private final ReserveRepository reserveRepository;


    @Override
    public SettlementResponseDTO getSettlement(Long claimId) {
        Settlement settlement = settlementRepository.findByClaimClaimId(claimId)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));
        return mapToResponse(settlement);
    }

    @Override
    public List<SettlementResponseDTO> getAllSettlements() {
        return settlementRepository.findAll()
                .stream()
                .map(this::mapToResponse) // This uses your existing private helper method
                .toList();
    }
    @Override
    public SettlementResponseDTO createSettlement(Long claimId, SettlementRequestDTO dto) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        if (claim.getStatus() != ClaimStatus.SETTLED)
            throw new RuntimeException("Settlement allowed only after claim is APPROVED/SETTLED");

        Settlement settlement = Settlement.builder()
                .claim(claim)
                .settlementAmount(dto.getSettlementAmount())
                .settlementDate(LocalDate.now())
                .status("PENDING") // Correct: Starts as PENDING
                .build();

        settlementRepository.save(settlement);

        // REMOVED: claim.setStatus(ClaimStatus.CLOSED);
        // Logic: Claim status ventane CLOSE avvakudadhu. Analyst pay chesaka avvali.

        return mapToResponse(settlement);
    }

    @Transactional
    public SettlementResponseDTO processPayment(Long settlementId) {
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));

        settlement.setStatus("PAID");
        settlement.setPaymentReference("PAY-" + System.currentTimeMillis());

        Claim claim = settlement.getClaim();
        claim.setStatus(ClaimStatus.CLOSED); // Final State

        // Sync Reserves to RELEASED
        List<Reserve> claimReserves = reserveRepository.findByClaimClaimId(claim.getClaimId());
        for(Reserve r : claimReserves) {
            r.setStatus("RELEASED"); // Only Released
            r.setUpdatedDate(LocalDate.now());
        }

        settlementRepository.save(settlement);
        return mapToResponse(settlement);
    }

    private SettlementResponseDTO mapToResponse(Settlement settlement) {
        return SettlementResponseDTO.builder()
                .settlementId(settlement.getSettlementId())
                .claimId(settlement.getClaim().getClaimId())
                .settlementAmount(settlement.getSettlementAmount())
                .settlementDate(settlement.getSettlementDate())
                .status(settlement.getStatus())
                .build();
    }
}
