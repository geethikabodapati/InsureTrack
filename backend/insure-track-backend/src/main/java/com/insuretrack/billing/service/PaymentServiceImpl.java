package com.insuretrack.billing.service;

import com.insuretrack.billing.dto.InvoiceResponseDTO;
import com.insuretrack.billing.dto.PaymentRequestDTO;
import com.insuretrack.billing.dto.PaymentResponseDTO;
import com.insuretrack.billing.entity.Invoice;
import com.insuretrack.billing.entity.Payment;
import com.insuretrack.billing.repository.InvoiceRepository;
import com.insuretrack.billing.repository.PaymentRepository;
import com.insuretrack.common.enums.InvoiceStatus;
import com.insuretrack.common.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public PaymentResponseDTO makePayment(
            Long invoiceId,
            PaymentRequestDTO dto) {

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (!invoice.getStatus().equals(InvoiceStatus.OPEN)) {
            throw new RuntimeException("Payment allowed only for OPEN invoice");
        }
        // Validation 2: Amount must be positive
        if (dto.getAmount() == null || dto.getAmount() <= 0) {
            throw new RuntimeException("Payment amount must be positive.");
        }

        // Validation 3: Payment method must not be null
        if (dto.getMethod() == null) {
            throw new RuntimeException("Payment method cannot be null.");
        }

        // Validation 4: Prevent overpayment
        double totalPaid = paymentRepository.findByInvoiceInvoiceId(invoiceId)
                .stream()
                .mapToDouble(Payment::getAmount)
                .sum();
        if (totalPaid + dto.getAmount() > invoice.getAmount()) {
            throw new RuntimeException("Payment exceeds invoice total.");
        }

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(dto.getAmount())
                .paidDate(LocalDate.now())
                .method(dto.getMethod())
                .status(PaymentStatus.COMPLETED)
                .build();

        paymentRepository.save(payment);

        // Update invoice status
//        if (dto.getAmount().equals(invoice.getAmount())) {
//            invoice.setStatus(InvoiceStatus.PAID);
//        }

        // Update invoice status if fully paid
        if (totalPaid + dto.getAmount() >= invoice.getAmount()) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoiceRepository.save(invoice);
        }

        return mapToResponse(payment);
    }

    @Override
    public List<PaymentResponseDTO> getPayments(Long invoiceId) {

        return paymentRepository.findByInvoiceInvoiceId(invoiceId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
    public PaymentResponseDTO createPendingPayment(Long invoiceId, Double amount) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        Payment pendingPayment = Payment.builder()
                .invoice(invoice)
                .amount(amount)
                .paidDate(null) // Not paid yet
                .status(PaymentStatus.PENDING) // Set status to PENDING
                .build();

        paymentRepository.save(pendingPayment);
        return mapToResponse(pendingPayment);
    }
    private PaymentResponseDTO mapToResponse(Payment payment) {

        return PaymentResponseDTO.builder()
                .paymentId(payment.getPaymentId())
                .invoiceId(payment.getInvoice().getInvoiceId())
                .amount(payment.getAmount())
                .paidDate(payment.getPaidDate())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .build();
    }


    @Override
    public List<PaymentResponseDTO> getAllPaymentsWithCustomer() {
        return paymentRepository.findAllPaymentsWithCustomer();
    }
}