package com.insuretrack.claims.service;

import com.insuretrack.claims.dto.SettlementRequestDTO;
import com.insuretrack.claims.dto.SettlementResponseDTO;

import java.util.List;

public interface SettlementService {

    SettlementResponseDTO createSettlement(
            Long claimId,
            SettlementRequestDTO dto);

    SettlementResponseDTO getSettlement(Long claimId);
    List<SettlementResponseDTO> getAllSettlements();
    SettlementResponseDTO processPayment(Long settlementId);
}
