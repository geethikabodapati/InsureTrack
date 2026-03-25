package com.insuretrack.policy.service;

import com.insuretrack.policy.dto.CancellationRequestDTO;
import com.insuretrack.policy.dto.CancellationResponseDTO;
import java.util.List;

public interface CancellationService {
    CancellationResponseDTO createRequest(CancellationRequestDTO request);
    List<CancellationResponseDTO> getAllCancellations();
    CancellationResponseDTO approveCancellation(Long id);
    List<CancellationResponseDTO> getByPolicy(Long policyId);
    CancellationResponseDTO cancel(CancellationRequestDTO request);
    CancellationResponseDTO approve_Cancellation(Long id);
    List<CancellationResponseDTO> getAllCancellationsForDashboard();
}