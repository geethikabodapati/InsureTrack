package com.insuretrack.billing.repository;

import com.insuretrack.billing.dto.InvoiceResponseDTO;
import com.insuretrack.billing.dto.PaymentResponseDTO;
import com.insuretrack.billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment,Long> {
    List<Payment> findByInvoiceInvoiceId(Long invoiceId);


    @Query("SELECT new com.insuretrack.billing.dto.PaymentResponseDTO(" +
            "p.paymentId, i.invoiceId, p.amount, p.paidDate, p.method, p.status, c.name) " +
            "FROM Payment p " +
            "JOIN p.invoice i " +
            "JOIN i.policy pol " +
            "JOIN pol.quote q " +
            "JOIN q.customer c")
    List<PaymentResponseDTO> findAllPaymentsWithCustomer();

    // Finds the latest payment by joining through the invoice to the policy
    @Query("SELECT p FROM Payment p WHERE p.invoice.policy.policyId = :policyId ORDER BY p.paymentId DESC")
    List<Payment> findPaymentsByPolicyId(@Param("policyId") Long policyId);

    List<Payment> findByInvoice_Policy_PolicyId(Long policyId);
}

