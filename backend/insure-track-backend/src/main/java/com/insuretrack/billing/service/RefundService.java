package com.insuretrack.billing.service;

import com.insuretrack.billing.dto.RefundRequestDTO;
import com.insuretrack.billing.dto.RefundResponseDTO;

import java.util.List;

public interface RefundService {
    RefundResponseDTO initiateRefund(Long paymentId, RefundRequestDTO dto);

    List<RefundResponseDTO> getAllRefundsWithCustomer();

    RefundResponseDTO completeRefund(Long refundId);
}
