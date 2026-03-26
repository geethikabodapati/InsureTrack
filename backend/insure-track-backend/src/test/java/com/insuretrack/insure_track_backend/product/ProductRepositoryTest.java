package com.insuretrack.insure_track_backend.product;
import com.insuretrack.product.entity.Coverage;
import com.insuretrack.product.entity.Product;
import com.insuretrack.product.entity.RatingRule;
import com.insuretrack.product.repository.CoverageRepository;
import com.insuretrack.product.repository.ProductRepository;
import com.insuretrack.product.repository.RatingRuleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.insuretrack.common.enums.CoverageType;
import com.insuretrack.common.enums.ObjectType;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProductRepositoryTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CoverageRepository coverageRepository;

    @Mock
    private RatingRuleRepository ratingRuleRepository;

    @Test
    void testProductRepository_Mock() {
        // Arrange
        Product product = new Product();
        product.setName(ObjectType.CAR.name());
        when(productRepository.findByName(ObjectType.CAR.name())).thenReturn(Optional.of(product));

        // Act
        Optional<Product> result = productRepository.findByName(ObjectType.CAR.name());

        // Assert
        assertTrue(result.isPresent());
        assertEquals((ObjectType.CAR.name()), result.get().getName());
    }

    @Test
    void testCoverageRepository_Mock() {
        // Arrange
        Coverage coverage = new Coverage();
        coverage.setCoverageType(CoverageType.COLLISION);
        when(coverageRepository.findByProduct_ProductId(1L)).thenReturn(List.of(coverage));

        // Act
        List<Coverage> result = coverageRepository.findByProduct_ProductId(1L);

        // Assert
        assertEquals(1, result.size());
        assertEquals(CoverageType.COLLISION, result.get(0).getCoverageType());
    }

    @Test
    void testRatingRuleRepository_Mock() {
        // Arrange
        RatingRule rule = new RatingRule();
        rule.setFactor("Age");
        when(ratingRuleRepository.findByProduct_ProductId(1L)).thenReturn(List.of(rule));

        // Act
        List<RatingRule> result = ratingRuleRepository.findByProduct_ProductId(1L);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Age", result.get(0).getFactor());
    }
}