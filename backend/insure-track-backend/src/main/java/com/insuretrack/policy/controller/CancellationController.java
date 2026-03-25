
package com.insuretrack.policy.controller;
import com.insuretrack.policy.dto.CancellationRequestDTO;
import com.insuretrack.policy.dto.CancellationResponseDTO;
import com.insuretrack.policy.service.CancellationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CancellationController {
    private final CancellationService cancellationService;
    // Customer creates a request
    @PostMapping("/customers/cancellation")
    public ResponseEntity<CancellationResponseDTO> requestCancellation(@RequestBody CancellationRequestDTO requestDTO){
        return ResponseEntity.ok(cancellationService.createRequest(requestDTO));
    }
    // Agent sees all requests
    @GetMapping("/agent/cancellation")
    public ResponseEntity<List<CancellationResponseDTO>> getAllRequests() {
        return ResponseEntity.ok(cancellationService.getAllCancellations());
    }
    // Agent approves and triggers refund/policy update
    @PutMapping("/agent/cancellation/{id}/approve")
    public ResponseEntity<CancellationResponseDTO> approve(@PathVariable Long id) {
        return ResponseEntity.ok(cancellationService.approveCancellation(id));
    }
    @PostMapping
    public ResponseEntity<CancellationResponseDTO> cancel(@RequestBody CancellationRequestDTO requestDTO){
        return  ResponseEntity.ok(cancellationService.cancel(requestDTO));
    }
    @GetMapping("/policy/{policyId}")
    public ResponseEntity<List<CancellationResponseDTO>> getByPolicy(@PathVariable Long policyId){
        return  ResponseEntity.ok(cancellationService.getByPolicy(policyId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CancellationResponseDTO>> getAll() {
        return ResponseEntity.ok(cancellationService.getAllCancellationsForDashboard());
    }

    // added change ******************
    @PutMapping("/{id}/approve")
    public ResponseEntity<CancellationResponseDTO> approved(@PathVariable("id") Long id) {
        return ResponseEntity.ok(cancellationService.approve_Cancellation(id));
    }
}
 