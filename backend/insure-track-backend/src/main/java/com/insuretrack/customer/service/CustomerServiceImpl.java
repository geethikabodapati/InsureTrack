package com.insuretrack.customer.service;

import com.insuretrack.policy.repository.PolicyRepository;
import com.insuretrack.claims.repository.ClaimRepository;
import com.insuretrack.policy.dto.PolicyResponseDTO;
import com.insuretrack.claims.dto.ClaimResponseDTO;
import com.insuretrack.customer.dto.*;
import com.insuretrack.customer.entity.Beneficiary;
import com.insuretrack.customer.entity.Customer;
import com.insuretrack.customer.entity.InsuredObject;
import com.insuretrack.customer.repository.BeneficiaryRepository;
import com.insuretrack.customer.repository.CustomerRepository;
import com.insuretrack.customer.repository.InsuredObjectRepository;
import com.insuretrack.product.dto.CoverageResponseDTO;
import com.insuretrack.product.dto.ProductResponseDTO;
import com.insuretrack.product.repository.ProductRepository;
import com.insuretrack.product.entity.Product;
import com.insuretrack.quote.dto.QuoteRequestDTO;
import com.insuretrack.quote.dto.QuoteResponseDTO;
import com.insuretrack.quote.entity.Quote;
import com.insuretrack.quote.repository.QuoteRepository;
import com.insuretrack.underwriting.service.UnderwritingService;
import com.insuretrack.user.entity.AuditLog;
import com.insuretrack.user.entity.User;
import com.insuretrack.user.repository.AuditLogRepository;
import com.insuretrack.user.repository.UserRepository;
import com.insuretrack.common.enums.Status;
import com.insuretrack.common.enums.QuoteStatus;

import com.insuretrack.common.exception.ResourceNotFoundException;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final InsuredObjectRepository insuredObjectRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final ProductRepository productRepository;
    private final QuoteRepository quoteRepository;
    private final ObjectMapper objectMapper;
    private final UnderwritingService underwritingService;

    @Override
    @Transactional
    public CustomerResponseDTO createCustomer(Long userId, CustomerRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer = Customer.builder()
                .user(user)
                .name(dto.name())
                .dob(dto.dob())
                .contactInfo(dto.contactInfo())
                .segment(dto.segment())
                .status(Status.ACTIVE)
                .build();

        Customer saved = customerRepository.save(customer);

        auditLogRepository.save(AuditLog.builder()
                .user(user)
                .action("REGISTER")
                .resource("CUSTOMER")
                .timestamp(LocalDateTime.now())
                .metadata("Customer successfully registered")
                .build());

        return mapToResponseDTO(saved);
    }

    @Override
    public CustomerResponseDTO getCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return mapToResponseDTO(customer);
    }

    @Override
    @Transactional
    public CustomerResponseDTO updateCustomer(Long customerId, CustomerRequestDTO dto) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        customer.setName(dto.name());
        customer.setDob(dto.dob());
        customer.setContactInfo(dto.contactInfo());
        customer.setSegment(dto.segment());
        customer.setStatus(Status.ACTIVE);

        Customer updated = customerRepository.save(customer);
        return mapToResponseDTO(updated);
    }

    @Override
    public void deactivateCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        customer.setStatus(Status.INACTIVE);
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void addBeneficiary(Long customerId, BeneficiaryRequestDTO dto) {
        validateBeneficiaryShare(customerId, dto.percentageShare());
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Beneficiary beneficiary = Beneficiary.builder()
                .customer(customer)
                .name(dto.name())
                .relationship(dto.relationship())
                .percentageShare(dto.percentageShare())
                .build();
        beneficiaryRepository.save(beneficiary);
    }

    private void validateBeneficiaryShare(Long customerId, BigDecimal newShare) {
        List<Beneficiary> beneficiaries = beneficiaryRepository.findByCustomer_CustomerId(customerId);
        BigDecimal total = beneficiaries.stream()
                .map(Beneficiary::getPercentageShare)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (total.add(newShare).compareTo(new BigDecimal("100")) > 0) {
            throw new RuntimeException("Total beneficiary share cannot exceed 100%");
        }
    }

    @Override
    public void updateBeneficiary(Long beneficiaryId, BeneficiaryRequestDTO dto) {
        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));
        beneficiary.setName(dto.name());
        beneficiary.setRelationship(dto.relationship());
        beneficiary.setPercentageShare(dto.percentageShare());
        beneficiaryRepository.save(beneficiary);
    }

    @Override
    public void removeBeneficiary(Long beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));
        beneficiaryRepository.delete(beneficiary);
    }

    @Override
    @Transactional
    public void addInsuredObject(Long customerId, InsuredObjectRequestDTO dto) {
        try {
            String json = objectMapper.writeValueAsString(dto.detailsJson());
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            InsuredObject insuredObject = InsuredObject.builder()
                    .customer(customer)
                    .objectType(dto.objectType())
                    .detailsJson(json)
                    .status(Status.ACTIVE)
                    .build();
            insuredObjectRepository.save(insuredObject);
        } catch (Exception e) {
            throw new RuntimeException("Error processing JSON details", e);
        }
    }

    @Override
    public void updateInsuredObject(Long objectId, RiskAssessmentRequestDTO dto) {
        InsuredObject object = insuredObjectRepository.findById(objectId)
                .orElseThrow(() -> new ResourceNotFoundException("Object not found"));
        object.setValuation(dto.getValuation());
        object.setRiskScore(dto.getRiskScore());
        insuredObjectRepository.save(object);
    }

    @Override
    public void deactivateInsuredObject(Long objectId) {
        InsuredObject object = insuredObjectRepository.findById(objectId)
                .orElseThrow(() -> new ResourceNotFoundException("Object not found"));
        object.setStatus(Status.INACTIVE);
        insuredObjectRepository.save(object);
    }

    @Override
    public List<CustomerResponseDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public List<PolicyResponseDTO> getPoliciesByCustomerId(Long customerId) {
        return policyRepository.findByQuote_Customer_CustomerId(customerId).stream()
                .map(p -> PolicyResponseDTO.builder()
                        .policyId(p.getPolicyId())
                        .policyNumber(p.getPolicyNumber())
                        .quoteId(p.getQuote() != null ? p.getQuote().getQuoteId() : null)
                        .effectiveDate(p.getEffectiveDate())
                        .expiryDate(p.getExpiryDate())
                        .premium(p.getPremium())
                        .status(p.getStatus() != null ? p.getStatus().name() : null)
                        .build())
                .toList();
    }

    @Override
    public List<ClaimResponseDTO> getClaimsByCustomerId(Long customerId) {
        return claimRepository.findByPolicy_Quote_Customer_CustomerId(customerId).stream()
                .map(c -> ClaimResponseDTO.builder()
                        .claimId(c.getClaimId())
                        .policyId(c.getPolicy() != null ? c.getPolicy().getPolicyId() : null)
                        .incidentDate(c.getIncidentDate())
                        .reportedDate(c.getReportedDate())
                        .claimType(c.getClaimType())
                        .description(c.getDescription())
                        .status(c.getStatus() != null ? c.getStatus().name() : null)
                        .build())
                .toList();
    }

    @Override
    public List<BeneficiaryResponseDTO> getBeneficiaries(Long customerId) {
        return beneficiaryRepository.findByCustomer_CustomerId(customerId).stream()
                .map(b -> new BeneficiaryResponseDTO(
                        b.getBeneficiaryId(), b.getName(), b.getRelationship(), b.getPercentageShare()))
                .toList();
    }

    @Override
    public List<InsuredObjectResponseDTO> getInsuredObjects(Long customerId) {
        return insuredObjectRepository.findByCustomer_CustomerId(customerId).stream()
                .map(obj -> new InsuredObjectResponseDTO(
                        obj.getObjectId(),
                        obj.getObjectType() != null ? obj.getObjectType().name() : null,
                        obj.getDetailsJson(),
                        obj.getValuation(),
                        obj.getRiskScore() != null ? obj.getRiskScore().doubleValue() : 0.0,
                        obj.getStatus()
                ))
                .toList();
    }


    @Override
    public List<ProductResponseDTO> getAllAvailableProducts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStatus() == Status.ACTIVE)
                .map(p -> ProductResponseDTO.builder()
                        .productId(p.getProductId())
                        .name(p.getName()) // Ensure this matches 'name' in React
                        .description(p.getDescription())
                        .status(p.getStatus())
                        // Manually map coverages to break the 500-error loop
                        .coverages(p.getCoverages().stream()
                                .map(c -> CoverageResponseDTO.builder()
                                        .coverageId(c.getCoverageId())
                                        .coverageType(c.getCoverageType())
                                        .coverageLimit(c.getCoverageLimit())
                                        .deductible(c.getDeductible())
                                        .build())
                                .toList())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public QuoteResponseDTO createQuoteRequest(Long customerId, Long productId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        String coveragesJson = "[]";
        try {
            coveragesJson = objectMapper.writeValueAsString(product.getCoverages());
        } catch (Exception e) {
            // Log error or handle
        }

        Quote quote = Quote.builder()
                .customer(customer)
                .product(product)
                .coveragesJSON(coveragesJson)
                .status(QuoteStatus.SUBMITTED)
                .createdDate(LocalDateTime.now())
                .premium(0.0)
                .build();

        Quote saved = quoteRepository.save(quote);
        return mapToQuoteResponseDTO(saved);
    }

    @Override
    public List<QuoteResponseDTO> getCustomerQuotes(Long customerId) {
        return quoteRepository.findByCustomer_CustomerId(customerId).stream()
                .map(this::mapToQuoteResponseDTO)
                .toList();
    }

    @Override
    public QuoteResponseDTO createQuote(QuoteRequestDTO request) {

        Quote quote = new Quote();
        quote.setCustomer(customerRepository.findById(request.getCustomerId()).orElseThrow());
        quote.setProduct(productRepository.findById(request.getProductId()).orElseThrow());
        quote.setInsuredObject(
                insuredObjectRepository.findById(request.getInsuredObjectId()).orElseThrow()
        );
        quote.setCoveragesJSON(request.getCoveragesJSON());
        quote.setCreatedDate(LocalDateTime.now());
        quote.setStatus(QuoteStatus.DRAFT);

        quoteRepository.save(quote);
        return mapToResponse(quote);
    }
    @Override
    public QuoteResponseDTO submitQuote(Long quoteId) {

        Quote quote = quoteRepository.findById(quoteId).orElseThrow();
        if(quote.getStatus().name()=="SUBMITTED"){
            throw new RuntimeException("Already in pending state");
        }
        quote.setStatus(QuoteStatus.SUBMITTED);
        underwritingService.createCase(quoteId);
        return mapToResponse(quote);
    }


    private QuoteResponseDTO mapToQuoteResponseDTO(Quote q) {
        QuoteResponseDTO dto = new QuoteResponseDTO();
        dto.setQuoteId(q.getQuoteId());
        dto.setPremium(q.getPremium());
        dto.setStatus(q.getStatus() != null ? q.getStatus().name() : null);
        dto.setCreatedDate(q.getCreatedDate());
        return dto;
    }

    private CustomerResponseDTO mapToResponseDTO(Customer c) {
        return new CustomerResponseDTO(
                c.getCustomerId(),
                c.getName(),
                c.getDob(),
                c.getContactInfo(),
                c.getSegment(),
                c.getStatus(),
                c.getUser() != null ? c.getUser().getUserId() : null
        );
    }
    private QuoteResponseDTO mapToResponse(Quote quote) {

        QuoteResponseDTO dto = new QuoteResponseDTO();
        dto.setQuoteId(quote.getQuoteId());
        dto.setPremium(quote.getPremium());
        dto.setStatus(quote.getStatus().name());
        dto.setCreatedDate(quote.getCreatedDate());

        return dto;
    }
}