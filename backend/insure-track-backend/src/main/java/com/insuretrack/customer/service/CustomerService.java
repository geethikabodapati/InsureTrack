package com.insuretrack.customer.service;

import com.insuretrack.claims.dto.ClaimResponseDTO;
import com.insuretrack.customer.dto.*;
import com.insuretrack.customer.entity.Customer;
import com.insuretrack.policy.dto.PolicyResponseDTO;
import com.insuretrack.customer.dto.*;
import com.insuretrack.policy.dto.PolicyResponseDTO;
import com.insuretrack.claims.dto.ClaimResponseDTO;
import com.insuretrack.product.dto.ProductResponseDTO;
import com.insuretrack.quote.dto.QuoteRequestDTO;
import com.insuretrack.quote.dto.QuoteResponseDTO;

import java.util.List;

public interface CustomerService {
    // Change from void to CustomerResponseDTO
    CustomerResponseDTO createCustomer(Long userId, CustomerRequestDTO dto);

    // Change from void to CustomerResponseDTO
    CustomerResponseDTO updateCustomer(Long customerId, CustomerRequestDTO dto);
    CustomerResponseDTO getCustomer(Long customerId);

    void deactivateCustomer(Long customerId);
    void addBeneficiary(Long customerId, BeneficiaryRequestDTO dto);
    void updateBeneficiary(Long beneficiaryId,BeneficiaryRequestDTO dto);
    void removeBeneficiary(Long beneficiaryId);
    void addInsuredObject(Long customerId, InsuredObjectRequestDTO dto);
    void updateInsuredObject(Long objectId, RiskAssessmentRequestDTO dto);
    void deactivateInsuredObject(Long objectId);
    // Add this to CustomerService interface

    List<PolicyResponseDTO> getPoliciesByCustomerId(Long customerId);
    List<ClaimResponseDTO> getClaimsByCustomerId(Long customerId);
    List<BeneficiaryResponseDTO> getBeneficiaries(Long customerId);
    List<InsuredObjectResponseDTO> getInsuredObjects(Long customerId);
    List<CustomerResponseDTO> getAllCustomers();
    // --- Product Discovery (The Shopping Step) ---
    List<ProductResponseDTO> getAllAvailableProducts();

    // --- Quotes (The Application Step) ---
    QuoteResponseDTO createQuoteRequest(Long customerId, Long productId);
    List<QuoteResponseDTO> getCustomerQuotes(Long customerId);



    QuoteResponseDTO createQuote(QuoteRequestDTO request);
    //QuoteResponseDTO calculatePremium(Long quoteId);
    QuoteResponseDTO submitQuote(Long quoteId);

}
