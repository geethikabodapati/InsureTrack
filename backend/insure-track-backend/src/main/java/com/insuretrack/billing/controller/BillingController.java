package com.insuretrack.billing.controller;

import com.insuretrack.billing.dto.*;
import com.insuretrack.billing.service.InvoiceService;
import com.insuretrack.billing.service.PaymentService;
import com.insuretrack.billing.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analyst/billing")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class    BillingController {

    private final InvoiceService invoiceService;
    private final PaymentService paymentService;
    private final RefundService refundService;

    // Create Invoice
    @PostMapping("/policies/{id}/invoice")
    public InvoiceResponseDTO createInvoice(
            @PathVariable Long id,
            @RequestBody InvoiceRequestDTO dto) {

        return invoiceService.createInvoice(id, dto);
    }

    // Get Invoices
    @GetMapping("/policies/{id}/invoices")
    public List<InvoiceResponseDTO> getInvoices(
            @PathVariable Long id) {

        return invoiceService.getInvoiceByPolicy(id);
    }

    // Make Payment
    @PostMapping("/invoices/{id}/pay")
    public PaymentResponseDTO makePayment(
            @PathVariable Long id,
            @RequestBody PaymentRequestDTO dto) {

        return paymentService.makePayment(id, dto);
    }

    // Get Payments
    @GetMapping("/invoices/{id}/payments")
    public List<PaymentResponseDTO> getPayments(
            @PathVariable Long id) {

        return paymentService.getPayments(id);
    }

    // Refund
    @PostMapping("/payments/{id}/refund")
    public RefundResponseDTO refund(
            @PathVariable Long id,
            @RequestBody RefundRequestDTO dto) {

        return refundService.initiateRefund(id, dto);
    }


    //get invoice with customer name by policy id
    @GetMapping("/policies/{id}/cinvoices")
    public List<InvoiceResponseDTO> getInvoicesWithCustomer(@PathVariable Long id) {
        return invoiceService.getInvoicesWithCustomer(id);
    }

    //get all invoices with customer name
    @GetMapping("/invoices/all")
    public List<InvoiceResponseDTO> getAllInvoicesWithCustomer() {
        return invoiceService.getAllInvoicesWithCustomer();
    }

    @GetMapping("/payments/all")
    public List<PaymentResponseDTO> getAllPaymentsWithCustomer() {
        return paymentService.getAllPaymentsWithCustomer(); // Check if service returns List
    }

    // 2. Refunds list kosam idhi check chey
    @GetMapping("/refunds/all")
    public List<RefundResponseDTO> getAllRefundsWithCustomer() {
        return refundService.getAllRefundsWithCustomer();
    }
    // In BillingController.java
    @PutMapping("/refunds/{id}/process")
    public RefundResponseDTO processRefund(@PathVariable Long id) {
        return refundService.completeRefund(id);
    }
}