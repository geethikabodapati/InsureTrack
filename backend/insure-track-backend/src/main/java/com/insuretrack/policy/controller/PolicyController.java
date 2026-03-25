package com.insuretrack.policy.controller;

import com.insuretrack.policy.dto.PolicyRequestDTO;
import com.insuretrack.policy.dto.PolicyResponseDTO;
import com.insuretrack.policy.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agent/policies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PolicyController {

    private final PolicyService policyService;

    @PostMapping("/issue")
    public ResponseEntity<PolicyResponseDTO> issue(
            @RequestBody PolicyRequestDTO request) {

        return ResponseEntity.ok(
                policyService.issuePolicy(request.getQuoteId())
        );
    }

    @GetMapping
    public ResponseEntity<List<PolicyResponseDTO>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @GetMapping("/{policyId}")
    public ResponseEntity<PolicyResponseDTO> get(
            @PathVariable Long policyId) {

        return ResponseEntity.ok(
                policyService.getPolicy(policyId)
        );
    }
    @GetMapping("/customers/{customerId}")
    public ResponseEntity<List<PolicyResponseDTO>> getPoliciesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(policyService.getPoliciesByCustomerId(customerId));
    }
}
