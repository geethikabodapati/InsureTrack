package com.insuretrack.claims.controller;

import com.insuretrack.billing.entity.Payment;
import com.insuretrack.billing.repository.PaymentRepository;
import com.insuretrack.claims.dto.*;
import com.insuretrack.claims.entity.Claim;
import com.insuretrack.claims.repository.ClaimRepository;
import com.insuretrack.claims.repository.ReserveRepository;
import com.insuretrack.claims.repository.SettlementRepository;
import com.insuretrack.claims.service.*;
import com.insuretrack.common.enums.ClaimStatus;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.policy.repository.PolicyRepository;
import com.insuretrack.user.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@RestController
@RequestMapping("/api/adjuster/claims")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;
    private final ReserveService reserveService;
    private final SettlementService settlementService;
    private final EvidenceService evidenceService;
    private final AssignmentService assignmentService;
    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final ReserveRepository reserveRepository;
    private final SettlementRepository settlementRepository;
    private final PaymentRepository paymentRepository;

    @PutMapping("/{id}/review")
    public ClaimResponseDTO review(@PathVariable Long id) {
        return claimService.moveToReview(id);
    }

    @PostMapping("/{id}/assign")
    public AssignmentResponseDTO assignAdjuster(
            @PathVariable Long id,
            @RequestBody AssignmentRequestDTO dto) {
        return assignmentService.assignAdjuster(id, dto);
    }

    @PostMapping("/{id}/reserve")
    public ReserveResponseDTO createReserve(
            @PathVariable Long id,
            @RequestBody ReserveRequestDTO dto) {
        return reserveService.createReserve(id, dto);
    }

    @PutMapping("/{id}/approve")
    public ClaimResponseDTO approve(@PathVariable Long id) {
        return claimService.approveClaim(id);
    }

    @PutMapping("/{id}/reject")
    public ClaimResponseDTO reject(@PathVariable Long id) {
        return claimService.rejectClaim(id);
    }

    @GetMapping("/{id}")
    public ClaimResponseDTO get(@PathVariable Long id) {
        return claimService.getClaim(id);
    }
    @GetMapping("/policy/{policyId}/reserves")
    public ResponseEntity<List<ReserveResponseDTO>> getReservesByPolicy(@PathVariable Long policyId) {
        return ResponseEntity.ok(reserveService.getReservesByPolicy(policyId));
    }
    @GetMapping("/policy/{policyId}")
    public ResponseEntity<PolicyInfoDTO> getPolicyInfo(@PathVariable Long policyId) {

        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found: " + policyId));

        // Sum all reserves across every claim on this policy
        Double totalReserved = reserveRepository.sumReservedByPolicy(policyId);
        if (totalReserved == null) totalReserved = 0.0;

        // Sum all settlements across every claim on this policy
        Double totalSettled = settlementRepository.sumSettledByPolicy(policyId);
        if (totalSettled == null) totalSettled = 0.0;

        Double premium    = policy.getPremium() != null ? policy.getPremium() : 0.0;
        Double remaining  = premium - totalSettled - totalReserved;

        // Get product name from policy → quote → product
        String productName = "Unknown";
        try {
            productName = policy.getQuote().getProduct().getName();
        } catch (Exception ignored) {}

        return ResponseEntity.ok(PolicyInfoDTO.builder()
                .policyId(policy.getPolicyId())
                .policyNumber(policy.getPolicyNumber())
                .effectiveDate(policy.getEffectiveDate())
                .expiryDate(policy.getExpiryDate())
                .premium(premium)
                .status(policy.getStatus() != null ? policy.getStatus().name() : "UNKNOWN")
                .productName(productName)
                .totalReservedOnPolicy(totalReserved)
                .totalSettledOnPolicy(totalSettled)
                .remainingBalance(remaining)
                .build());
    }
    @PostMapping("/{id}/settlement")
    public SettlementResponseDTO createSettlement(
            @PathVariable Long id,
            @RequestBody SettlementRequestDTO dto) {
        return settlementService.createSettlement(id, dto);
    }

    @GetMapping("/{id}/reserves")
    public List<ReserveResponseDTO> getReserves(@PathVariable Long id) {
        return reserveService.getReservesByClaim(id);
    }

    @GetMapping("/{id}/settlement")
    public SettlementResponseDTO getSettlement(@PathVariable Long id) {
        return settlementService.getSettlement(id);
    }
    @GetMapping("/settlements/all")
    public List<SettlementResponseDTO> getAllSettlements() {
        // You'll need to add this method to your settlementService
        return settlementService.getAllSettlements();
    }
    @PostMapping("/settlements/{id}/pay")
    public SettlementResponseDTO paySettlement(@PathVariable Long id) {
        return settlementService.processPayment(id);
    }

    @GetMapping("/policy/{policyId}/coverages")
    public ResponseEntity<List<String>> getCoveragesByPolicy(@PathVariable Long policyId) {

        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found: " + policyId));

        List<String> coverageTypes = policy.getQuote()
                .getProduct()
                .getCoverages()
                .stream()
                .map(c -> {
                    Object type = c.getCoverageType();
                    if (type == null) return null;
                    // Works whether getCoverageType() returns a String or an Enum
                    return type.toString();
                })
                .filter(t -> t != null && !t.isEmpty())
                .distinct()
                .toList();

        // If no coverages configured, return sensible defaults
        if (coverageTypes.isEmpty()) {
            return ResponseEntity.ok(List.of("AUTO", "PROPERTY", "HEALTH", "LIFE", "COMMERCIAL"));
        }

        return ResponseEntity.ok(coverageTypes);
    }
    @GetMapping("/{id}/evidence")
    public List<EvidenceResponseDTO> getEvidence(@PathVariable Long id) {
        return evidenceService.getEvidenceByClaim(id);
    }

    @GetMapping("/{id}/assignment")
    public AssignmentResponseDTO getAssignment(@PathVariable Long id) {
        return assignmentService.getByClaimId(id);
    }
    @GetMapping
    public List<ClaimResponseDTO> getAll() {
        return claimService.getAllClaims();
    }

    @GetMapping("/status/{status}")
    public List<ClaimResponseDTO> getByStatus(@PathVariable String status) {
        return claimService.getClaimsByStatus(status);
    }

    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ClaimResponseDTO submitClaimWithEvidence(
            @RequestPart("claim") String claimJson,
            @RequestPart("file") MultipartFile file) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        ClaimRequestDTO dto = mapper.readValue(claimJson, ClaimRequestDTO.class);

        // 1. Create the claim
        ClaimResponseDTO response = claimService.createClaim(dto);

        // 2. Upload the evidence for this new claim
        EvidenceRequestDTO evidenceDto = new EvidenceRequestDTO();
        evidenceDto.setType("INCIDENT_PHOTO");
        evidenceService.uploadEvidence(response.getClaimId(), evidenceDto, file);

        return response;
    }

    @GetMapping("/customers/{customerId}")
    public List<ClaimResponseDTO> getClaimsByCustomer(@PathVariable Long customerId) {
        return claimService.getClaimsByCustomerId(customerId);
    }
    @PostMapping
    public ClaimResponseDTO createClaim(@RequestBody ClaimRequestDTO dto) {

        // ── Change 4: Block if this policy has any open/active claims ──────
        // 1. Fetch payments
        List<Payment> payments = paymentRepository.findPaymentsByPolicyId(dto.getPolicyId());

// 2. Check if at least one payment is COMPLETED
        boolean hasCompletedPayment = payments.stream()
                .anyMatch(p -> "COMPLETED".equalsIgnoreCase(p.getStatus().toString())); // Or p.getStatus() == PaymentStatus.COMPLETED

// 3. Validation
        if (!hasCompletedPayment) {
            throw new RuntimeException("You must have at least one completed payment to file a claim.");
        }

// 4. Check for existing active claims (Your existing logic)
        List<Claim> existingClaims = claimRepository.findByPolicyPolicyId(dto.getPolicyId());
        boolean hasActiveClaim = existingClaims.stream().anyMatch(c ->
                c.getStatus() != ClaimStatus.CLOSED && c.getStatus() != ClaimStatus.DENIED
        );

        if (hasActiveClaim) {
            throw new RuntimeException("An active claim already exists for this policy.");
        }

        if (hasActiveClaim) {
            throw new RuntimeException(
                    "This policy already has an active claim in progress. " +
                            "All existing claims must be CLOSED or DENIED before filing a new one."
            );
        }

        return claimService.createClaim(dto);
    }
}
