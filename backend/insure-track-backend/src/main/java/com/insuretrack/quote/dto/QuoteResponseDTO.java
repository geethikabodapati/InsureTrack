package com.insuretrack.quote.dto;

import com.insuretrack.common.enums.QuoteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuoteResponseDTO {
    private Long quoteId;
    private Double premium;
    private String status;
    private LocalDateTime createdDate;
    private String customerName;
    private Long insuredObjectId;
}

