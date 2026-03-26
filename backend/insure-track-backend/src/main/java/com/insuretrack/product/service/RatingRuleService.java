package com.insuretrack.product.service;

import com.insuretrack.common.enums.Status;
import com.insuretrack.customer.entity.InsuredObject;
import com.insuretrack.product.entity.Product;
import com.insuretrack.product.entity.RatingRule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RatingRuleService {

    private final ObjectMapper objectMapper;

    public Double calculatePremium(Product product,
                                   InsuredObject insuredObject,
                                   List<RatingRule> rules) {

        if (product == null) throw new RuntimeException("Product cannot be null");
        if (product.getStatus() != Status.ACTIVE) throw new RuntimeException("Product is not active");
        if (insuredObject == null) throw new RuntimeException("Insured object cannot be null");

        // Base premium from valuation (cannot be null as it is a primitive double)
        double basePremium = (insuredObject.getValuation() != 0.0)
                ? insuredObject.getValuation()
                : 0.0;

        if (rules == null || rules.isEmpty()) {
            return basePremium;
        }

        Map<String, Object> detailsMap;
        try {
            String json = insuredObject.getDetailsJson();
            if (json == null || json.trim().isEmpty()) {
                detailsMap = Map.of();
            } else {
                detailsMap = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            detailsMap = Map.of();
        }

        double totalAdjustment = 0.0;

        for (RatingRule rule : rules) {
            String factor = rule.getFactor().toLowerCase();
            double adjustment = 0.0;

            // FIX: Convert Enum to String to avoid "incompatible types" error
            if (factor.equals("vehicletype")) {
                String typeStr = (insuredObject.getObjectType() != null)
                        ? insuredObject.getObjectType().name()
                        : "UNKNOWN";

                adjustment = handleNonNumericFactor(factor, typeStr, rule.getWeight());
            }
            else {
                Object rawValue = detailsMap.get(factor);

                if (rawValue == null) {
                    adjustment = handleNonNumericFactor(factor, "unknown", rule.getWeight());
                } else {
                    try {
                        double numericValue = Double.parseDouble(rawValue.toString());
                        adjustment = numericValue * rule.getWeight();
                    } catch (NumberFormatException ex) {
                        adjustment = handleNonNumericFactor(factor, rawValue.toString(), rule.getWeight());
                    }
                }
            }
            totalAdjustment += adjustment;
        }

        return basePremium * totalAdjustment;
    }

    private double handleNonNumericFactor(String factor, String value, Double weight) {
        String safeValue = (value == null) ? "UNKNOWN" : value.toUpperCase();

        switch (factor.toLowerCase()) {
            case "vehicletype":
                // Logic covers CAR, BIKE, BUS, AUTO, TRUCK, TRACTOR, VAN
                return switch (safeValue) {
                    case "CAR"     -> 2.0 * weight;
                    case "BIKE"    -> 1.5 * weight;
                    case "BUS"     -> 3.0 * weight;
                    case "AUTO"    -> 1.8 * weight;
                    case "TRUCK"   -> 3.5 * weight;
                    case "TRACTOR" -> 2.5 * weight;
                    case "VAN"     -> 2.2 * weight;
                    default        -> 3.0 * weight;
                };

            case "location":
                if (safeValue.equals("URBAN")) return 2.0 * weight;
                if (safeValue.equals("RURAL")) return 1.0 * weight;
                return 1.5 * weight;

            default:
                return 1.1; // Default fallback for unhandled factors
        }
    }
}