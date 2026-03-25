package com.insuretrack.billing.dto;

import com.insuretrack.common.enums.InvoiceStatus;
import com.insuretrack.common.enums.PaymentMethod;
import com.insuretrack.common.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cglib.core.Local;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {
    private Long paymentId;
    private Long invoiceId;
    private Double amount;
    private LocalDate paidDate;
    private PaymentMethod method;
    private PaymentStatus status;

    private String customerName;

//    public PaymentResponseDTO(Long paymentId,
//                              Long invoiceId,
//                              Double amount,
//                              LocalDate paidDate,
//                              PaymentMethod method,
//                              PaymentStatus status,
//                              String customerName) {
//        this.paymentId = paymentId;
//        this.invoiceId = invoiceId;
//        this.amount = amount;
//        this.paidDate = paidDate;
//        this.method = method;
//        this.status = status;
//        this.customerName = customerName;
//    }
//


}
