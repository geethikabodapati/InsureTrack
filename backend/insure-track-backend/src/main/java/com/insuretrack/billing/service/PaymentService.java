package com.insuretrack.billing.service;

import com.insuretrack.billing.dto.InvoiceResponseDTO;
import com.insuretrack.billing.dto.PaymentRequestDTO;
import com.insuretrack.billing.dto.PaymentResponseDTO;

import java.util.List;

public interface PaymentService {
    PaymentResponseDTO makePayment(Long invoiceId, PaymentRequestDTO dto);
    List<PaymentResponseDTO> getPayments(Long invoiceId);
    PaymentResponseDTO createPendingPayment(Long invoiceId, Double amount);
    // ✅ new method
    List<PaymentResponseDTO> getAllPaymentsWithCustomer();
}
