package com.insuretrack.product.service;

import com.insuretrack.common.enums.Status;
import com.insuretrack.common.exception.ResourceNotFoundException;
import com.insuretrack.policy.repository.PolicyRepository;
import com.insuretrack.product.dto.*;
import com.insuretrack.product.entity.Coverage;
import com.insuretrack.product.entity.Product;
import com.insuretrack.product.entity.RatingRule;
import com.insuretrack.product.repository.CoverageRepository;
import com.insuretrack.product.repository.ProductRepository;
import com.insuretrack.product.repository.RatingRuleRepository;
import com.insuretrack.reporting.dto.RiskMetricResponseDTO;
import com.insuretrack.reporting.service.RiskMetricService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CoverageRepository coverageRepository;
    private final RatingRuleRepository ratingRuleRepository;
    private final PolicyRepository policyRepository; // Assuming you have these
    private final RiskMetricService riskMetricService;
    private final ObjectMapper objectMapper;
    @Override
    public DashboardStatsDTO getDashboardStats() {
        Double premium = policyRepository.sumGrossPremium();
        long activeCount = policyRepository.countByStatus(com.insuretrack.common.enums.PolicyStatus.ACTIVE);
        long vehicleCount = policyRepository.countDistinctVehicles();

        RiskMetricResponseDTO riskDto = riskMetricService.generatePortfolioMetrics();
        String riskScoreLabel = "0.0%";
        try {
            Map<String, Object> metricsMap = objectMapper.readValue(riskDto.getMetrics(), Map.class);
            double combinedRatio = ((Number) metricsMap.getOrDefault("combinedRatio", 0.0)).doubleValue() * 100;
            riskScoreLabel = String.format("%.1f%%", combinedRatio);
        } catch (Exception e) {
            riskScoreLabel = "Calculating...";
        }
        List<DashboardStatsDTO.VehicleDistribution> vehicleDist = policyRepository.getVehicleTypeDistribution();
        vehicleDist.forEach(v -> {
            if (v.getType().equalsIgnoreCase("VEHICLE")) v.setType("Car");
            v.setColor(getColorForType(v.getType()));
        });

        // 4. Monthly Performance Trends (Last 6 Months)
        List<DashboardStatsDTO.TrendData> trends = new ArrayList<>();
        java.time.LocalDate now = java.time.LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            java.time.LocalDate target = now.minusMonths(i);
            String monthName = target.getMonth().name().substring(0, 3);

            // Mocking these values - Replace with actual repo calls:
            // policyRepository.sumPremiumByMonth(...) & settlementRepository.sumByMonth(...)
            double mockPremium = 50000 + (Math.random() * 20000);
            double mockClaims = 10000 + (Math.random() * 15000);

            trends.add(new DashboardStatsDTO.TrendData(monthName, mockPremium, mockClaims));
        }

        return DashboardStatsDTO.builder()
                .totalGrossPremium(premium != null ? premium : 0.0)
                .activePolicies(activeCount)
                .totalVehicles(vehicleCount)
                .portfolioRiskScore(riskScoreLabel)
                .monthlyTrends(trends)
                .vehicleDistribution(vehicleDist)
                .build();
    }

    private String getColorForType(String type) {
        switch (type.toUpperCase()) {
            case "CAR": return "#3b82f6";
            case "BUS": return "#f59e0b";
            case "BIKE": return "#10b981";
            case "TRUCK": return "#ef4444";
            default: return "#8b5cf6";
        }
    }
    @Override
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(Status.INACTIVE)
                .build();
        return mapToDTO(productRepository.save(product));
    }

    @Override
    public ProductResponseDTO activateProduct(Long productId) {
        Product product = getProduct(productId);
        product.setStatus(Status.ACTIVE);
        return mapToDTO(productRepository.save(product));
    }

    @Override
    public ProductResponseDTO deactivateProduct(Long productId) {
        Product product = getProduct(productId);
        product.setStatus(Status.INACTIVE);
        return mapToDTO(productRepository.save(product));
    }

    @Override
    public ProductResponseDTO addCoverage(Long productId, CoverageRequestDTO request) {
        Product product = getProduct(productId);

        Coverage coverage = Coverage.builder()
                .product(product)
                .coverageType(request.getCoverageType())
                .coverageLimit(request.getCoverageLimit())
                .deductible(request.getDeductible())
                .build();

        coverageRepository.save(coverage);
        product.getCoverages().add(coverage);

        // AUTO-ACTIVATE LOGIC
        checkAndSetAutoStatus(product);

        return mapToDTO(productRepository.save(product));
    }

    @Override
    public ProductResponseDTO addRatingRule(Long productId, RatingRuleRequestDTO request) {
        Product product = getProduct(productId);

        RatingRule rule = RatingRule.builder()
                .product(product)
                .factor(request.getFactor())
                .weight(request.getWeight())
                .expression(request.getExpression())
                .build();

        ratingRuleRepository.save(rule);
        product.getRatingRules().add(rule);

        // AUTO-ACTIVATE LOGIC
        checkAndSetAutoStatus(product);

        return mapToDTO(productRepository.save(product));
    }

    /**
     * Helper to flip status based on business rules:
     * Product is ACTIVE only if it has at least 1 coverage AND 1 rating rule.
     */
    private void checkAndSetAutoStatus(Product product) {
        boolean hasCoverage = product.getCoverages() != null && !product.getCoverages().isEmpty();
        boolean hasRules = product.getRatingRules() != null && !product.getRatingRules().isEmpty();

        if (hasCoverage && hasRules) {
            product.setStatus(Status.ACTIVE);
        } else {
            product.setStatus(Status.INACTIVE);
        }
    }

    @Override
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<CoverageResponseDTO> getAllCoverages() {
        return coverageRepository.findAll().stream()
                .map(c -> CoverageResponseDTO.builder()
                        .coverageId(c.getCoverageId())
                        .productId(c.getProduct().getProductId())
                        .productName(c.getProduct().getName()) // Map the name here
                        .coverageType(c.getCoverageType())
                        .coverageLimit(c.getCoverageLimit())
                        .deductible(c.getDeductible())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCoverage(Long coverageId) {
        Coverage coverage = coverageRepository.findById(coverageId)
                .orElseThrow(() -> new RuntimeException("Coverage not found"));

        Product product = coverage.getProduct();

        // --- THE CRITICAL FIX START ---
        if (product.getCoverages() != null) {
            product.getCoverages().remove(coverage);
        }
        // --- THE CRITICAL FIX END ---

        coverageRepository.delete(coverage);

        // Now when we check status and save, the deleted coverage is gone from the list
        checkAndSetAutoStatus(product);
        productRepository.save(product);
    }
    @Transactional
    public void deleteRatingRule(Long id) {
        RatingRule rule = ratingRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));

        // If you have a bidirectional relationship, remove it from the product list first
        Product product = rule.getProduct();
        if (product != null) {
            product.getRatingRules().remove(rule);
        }

        ratingRuleRepository.delete(rule);
    }

//    @Override
//    public List<ProductResponseDTO> getActiveProducts() {
////        @Autowired
////        private ProductRepository productRepository;
////
////        public List<ProductResponseDTO> getActiveProducts() {
////            // Fetch only active entities
////            List<Product> activeProducts = productRepository.findAllByStatus("ACTIVE");
//
//            // Map entities to DTOs and return
//            return activeProducts.stream()
//                    .map(product -> new ProductResponseDTO(product))
//                    .collect(Collectors.toList());
//    }

    @Override
    public List<RatingRuleResponseDTO> getAllRatingRules() {
        return ratingRuleRepository.findAll().stream()
                .map(r -> RatingRuleResponseDTO.builder()
                        .ruleId(r.getRuleId())
                        .productId(r.getProduct().getProductId())
                        .factor(r.getFactor())
                        .weight(r.getWeight())
                        .expression(r.getExpression())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(Long productId) {
        Product product = getProduct(productId);
        productRepository.delete(product);
    }


    private Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    private ProductResponseDTO mapToDTO(Product product) {
        List<CoverageResponseDTO> coverageDTOs = product.getCoverages() == null ? List.of() :
                product.getCoverages().stream()
                        .map(c -> CoverageResponseDTO.builder()
                                .coverageId(c.getCoverageId())
                                .coverageType(c.getCoverageType())
                                .coverageLimit(c.getCoverageLimit())
                                .deductible(c.getDeductible())
                                .build()).toList();

        List<RatingRuleResponseDTO> ruleDTOs = product.getRatingRules() == null ? List.of() :
                product.getRatingRules().stream()
                        .map(r -> RatingRuleResponseDTO.builder()
                                .ruleId(r.getRuleId())
                                .factor(r.getFactor())
                                .weight(r.getWeight())
                                .expression(r.getExpression())
                                .build()).toList();

        return ProductResponseDTO.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .description(product.getDescription())
                .status(product.getStatus())
                .coverages(coverageDTOs)
                .ratingRules(ruleDTOs)
                .build();
    }



}