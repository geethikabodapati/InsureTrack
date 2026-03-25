package com.insuretrack.product.service;

import com.insuretrack.product.dto.*;

import java.util.List;

public interface ProductService {
    DashboardStatsDTO getDashboardStats();

    ProductResponseDTO createProduct(ProductRequestDTO request);
    ProductResponseDTO activateProduct(Long productId);
    ProductResponseDTO deactivateProduct(Long productId);
    ProductResponseDTO addCoverage(Long productId, CoverageRequestDTO request);
    ProductResponseDTO addRatingRule(Long productId, RatingRuleRequestDTO request);
    List<ProductResponseDTO> getAllProducts();

    List<CoverageResponseDTO> getAllCoverages();

    List<RatingRuleResponseDTO> getAllRatingRules();

    void deleteProduct(Long id);

    void deleteCoverage(Long id);

    void deleteRatingRule(Long id);

//    List<ProductResponseDTO> getActiveProducts();
}
