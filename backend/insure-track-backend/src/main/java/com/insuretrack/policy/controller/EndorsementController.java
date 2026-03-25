package com.insuretrack.policy.controller;

import com.insuretrack.policy.dto.EndorsementRequestDTO;
import com.insuretrack.policy.dto.EndorsementResponseDTO;
import com.insuretrack.policy.service.EndorsementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api") // Base mapping for all endpoints in this controller
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EndorsementController {

    private final EndorsementService endorsementService;

    // Final URL: POST /api/customer/endorsements
    @PostMapping("/customers/endorsements")
    public ResponseEntity<EndorsementResponseDTO> create(@RequestBody EndorsementRequestDTO requestDTO){
        return ResponseEntity.ok(endorsementService.create(requestDTO));
    }

    // Final URL: GET /api/agent/endorsements
    @GetMapping("/agent/endorsements")
    public ResponseEntity<List<EndorsementResponseDTO>> getAll() {
        return ResponseEntity.ok(endorsementService.getAllEndorsements());
    }

    // Final URL: PUT /api/agent/endorsements/{id}/approve
    @PutMapping("/agent/endorsements/{id}/approve")
    public ResponseEntity<EndorsementResponseDTO> approve(@PathVariable Long id) {
        return ResponseEntity.ok(endorsementService.approveEndorsement(id));
    }

}