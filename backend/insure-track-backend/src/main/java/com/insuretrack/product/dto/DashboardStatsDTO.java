package com.insuretrack.product.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder // This enables the builder you are using
public class DashboardStatsDTO {
    private double totalGrossPremium;
    private long activePolicies;
    private long totalVehicles;
    private String portfolioRiskScore; // <--- Add this field
    private List<TrendData> monthlyTrends;
    private List<VehicleDistribution> vehicleDistribution;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrendData {
        private String monthName;
        private double claimCount;
        private double amount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VehicleDistribution {
        private String type;
        private int count;
        private String color;
    }
}