package com.insuretrack.policy.repository;

import com.insuretrack.common.enums.PolicyStatus;
import com.insuretrack.policy.entity.Policy;
import com.insuretrack.product.dto.DashboardStatsDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    Optional<Policy> findByQuoteQuoteId(Long quoteId);
    List<Policy> findByStatus(PolicyStatus status);
    List<Policy> findByQuote_Customer_CustomerId(Long customerId);
    @Query("SELECT SUM(p.premium) FROM Policy p WHERE p.status = com.insuretrack.common.enums.PolicyStatus.ACTIVE")
    Double sumGrossPremium();

    long countByStatus(PolicyStatus status);

    @Query("SELECT COUNT(DISTINCT p.quote.insuredObject.objectId) FROM Policy p")
    long countDistinctVehicles();

    @Query("SELECT new com.insuretrack.product.dto.DashboardStatsDTO$VehicleDistribution(" +
            "CAST(p.quote.insuredObject.objectType AS string), " +
            "CAST(COUNT(p) AS int), " +
            "'') " +
            "FROM Policy p GROUP BY p.quote.insuredObject.objectType")
    List<DashboardStatsDTO.VehicleDistribution> getVehicleTypeDistribution();
}