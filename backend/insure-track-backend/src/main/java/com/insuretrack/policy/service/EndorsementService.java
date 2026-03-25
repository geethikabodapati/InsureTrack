package com.insuretrack.policy.service;

import com.insuretrack.policy.dto.EndorsementRequestDTO;
import com.insuretrack.policy.dto.EndorsementResponseDTO;

import java.util.List;

public interface EndorsementService {
    EndorsementResponseDTO create(EndorsementRequestDTO requestDTO);
    List<EndorsementResponseDTO> getAllEndorsements();
    EndorsementResponseDTO approveEndorsement(Long endorsementId);

}
