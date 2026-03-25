package com.insuretrack.quote.controller;


import com.insuretrack.common.enums.NotificationCategory;
import com.insuretrack.notification.service.NotificationService;
import com.insuretrack.quote.dto.QuoteRequestDTO;
import com.insuretrack.quote.dto.QuoteResponseDTO;
import com.insuretrack.quote.service.QuoteService;
import jakarta.validation.constraints.DecimalMax;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agent/quotes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")

public class QuoteController {


    private final QuoteService quoteService;

    @PostMapping("/draft")
    public ResponseEntity<QuoteResponseDTO> createDraft(
            @RequestBody QuoteRequestDTO request) {

        return ResponseEntity.ok(
                quoteService.createQuote(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<QuoteResponseDTO>> getAllQuotes() {
        // This tells Spring: "When someone does a GET to /api/agent/quotes, run this"
        return ResponseEntity.ok(quoteService.findAllQuotes());
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<QuoteResponseDTO> submitQuote(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                quoteService.submitQuote(id)
        );
    }

    @PutMapping("/{id}/rate")
    public ResponseEntity<QuoteResponseDTO> rateQuote(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                quoteService.rateQuote(id)
        );
    }
    @GetMapping("/customers/{customerId}")
    public ResponseEntity<List<QuoteResponseDTO>> getQuotesByCustomer(@PathVariable Long customerId) {
        List<QuoteResponseDTO> quotes = quoteService.getQuotesByCustomerId(customerId);
        return ResponseEntity.ok(quotes);
    }
}