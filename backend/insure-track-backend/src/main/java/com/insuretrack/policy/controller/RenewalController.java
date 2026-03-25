package com.insuretrack.policy.controller;

import com.insuretrack.policy.dto.RenewalRequestDTO;
import com.insuretrack.policy.dto.RenewalResponseDTO;
import com.insuretrack.policy.service.RenewalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api") // Base mapping
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RenewalController {

    private final RenewalService renewalService;

    // Customer creates renewal request
    @PostMapping("/customer/renewal")
    public ResponseEntity<RenewalResponseDTO> createOffer(@RequestBody RenewalRequestDTO requestDTO){
        return ResponseEntity.ok(renewalService.createOffer(requestDTO));
    }

    // Agent sees all renewals on dashboard
    @GetMapping("/agent/renewals")
    public ResponseEntity<List<RenewalResponseDTO>> getAllRenewals() {
        return ResponseEntity.ok(renewalService.getAllRenewals());
    }

    @GetMapping("/customer/renewal/policy/{policyId}")
    public ResponseEntity<List<RenewalResponseDTO>> getByPolicy(@PathVariable Long policyId){
        return ResponseEntity.ok(renewalService.getByPolicy(policyId));
    }
    @PatchMapping("/agent/renewal/{id}/status")
    public ResponseEntity<String> updateStatus(@PathVariable Long id, @RequestParam String status) {
        renewalService.updateRenewalStatus(id, status);
        return ResponseEntity.ok("Status updated successfully to " + status);
    }
}