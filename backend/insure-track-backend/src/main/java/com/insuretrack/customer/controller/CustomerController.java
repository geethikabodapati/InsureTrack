package com.insuretrack.customer.controller;

import com.insuretrack.customer.dto.*;
import com.insuretrack.customer.service.CustomerService;
import com.insuretrack.policy.dto.PolicyResponseDTO; // Import your Policy DTO
import com.insuretrack.claims.dto.ClaimResponseDTO; // Import your Claim DTO
import com.insuretrack.product.dto.ProductResponseDTO;
import com.insuretrack.product.service.ProductService;
import com.insuretrack.quote.dto.QuoteRequestDTO;
import com.insuretrack.quote.dto.QuoteResponseDTO;
import com.insuretrack.quote.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("http://localhost:3000")
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final QuoteService  quoteService;
    private final ProductService productService;
    // --- PROFILE MANAGEMENT ---

    @PostMapping("/{userId}")
    public ResponseEntity<CustomerResponseDTO> createCustomer(@PathVariable Long userId, @RequestBody CustomerRequestDTO dto){
        // This will work now because service returns a DTO instead of void
        return ResponseEntity.ok(customerService.createCustomer(userId, dto));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerResponseDTO> getCustomer(@PathVariable Long customerId){
        return ResponseEntity.ok(customerService.getCustomer(customerId));
    }

    @PutMapping("/update/{customerId}")
    public ResponseEntity<CustomerResponseDTO> updateCustomer(@PathVariable Long customerId, @RequestBody CustomerRequestDTO dto){
        return ResponseEntity.ok(customerService.updateCustomer(customerId, dto));
    }

    // --- POLICY MAPPINGS (For the 'Policies' Tab) ---

    @GetMapping("/{customerId}/policies")
    public ResponseEntity<List<PolicyResponseDTO>> getCustomerPolicies(@PathVariable Long customerId) {
        // You will need to add this method to CustomerService
        return ResponseEntity.ok(customerService.getPoliciesByCustomerId(customerId));
    }

    // --- CLAIM MAPPINGS (For the 'Claims' Tab) ---

    @GetMapping("/{customerId}/claims")
    public ResponseEntity<List<ClaimResponseDTO>> getCustomerClaims(@PathVariable Long customerId) {
        // You will need to add this method to CustomerService
        return ResponseEntity.ok(customerService.getClaimsByCustomerId(customerId));
    }

    // --- BENEFICIARIES & OBJECTS ---

    @PostMapping("/{customerId}/beneficiaries")
    public void addBeneficiary(@PathVariable Long customerId, @RequestBody BeneficiaryRequestDTO dto){
        customerService.addBeneficiary(customerId, dto);
    }

    @GetMapping("/{customerId}/beneficiaries")
    public ResponseEntity<List<BeneficiaryResponseDTO>> getBeneficiaries(@PathVariable Long customerId) {
        // This calls the service method we fixed earlier
        return ResponseEntity.ok(customerService.getBeneficiaries(customerId));
    }

    @PostMapping("/{customerId}/insuredobjects")
    public void addInsuredObject(@PathVariable Long customerId, @RequestBody InsuredObjectRequestDTO dto){
        customerService.addInsuredObject(customerId, dto);
    }

    @GetMapping("/{customerId}/insuredobjects")
    public ResponseEntity<List<InsuredObjectResponseDTO>> getInsuredObjects(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerService.getInsuredObjects(customerId));
    }
    @PutMapping("/update/insuredobj/{objectId}")
    public void updateInsuredObject(@PathVariable Long objectId,@RequestBody RiskAssessmentRequestDTO dto){
        customerService.updateInsuredObject(objectId,dto);
    }

    // --- EXISTING UTILITIES ---

    @GetMapping
    public List<CustomerResponseDTO> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @PatchMapping("/{customerId}/deactivate")
    public void deactivateCustomer(@PathVariable Long customerId){
        customerService.deactivateCustomer(customerId);
    }
    // 1. Get all active products
    @GetMapping("/products/available")
    public ResponseEntity<List<ProductResponseDTO>> getAvailableProducts() {
        return ResponseEntity.ok(customerService.getAllAvailableProducts());
    }

    // 2. Apply for a specific product
    @PostMapping("/{customerId}/apply/{productId}")
    public ResponseEntity<QuoteResponseDTO> applyForInsurance(
            @PathVariable Long customerId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(customerService.createQuoteRequest(customerId, productId));
    }
//    @PostMapping("/draft")
//    public ResponseEntity<QuoteResponseDTO> createDraft(
//            @RequestBody QuoteRequestDTO request) {
//
//        return ResponseEntity.ok(
//                quoteService.createQuote(request)
//        );
//    }
//
//    @PutMapping("/{id}/submit")
//    public ResponseEntity<QuoteResponseDTO> submitQuote(
//            @PathVariable Long id) {
//
//        return ResponseEntity.ok(
//                quoteService.submitQuote(id)
//        );
//    }
//    List<ProductResponseDTO> getAll() {
//        return productService.getAllProducts();
//    }


}