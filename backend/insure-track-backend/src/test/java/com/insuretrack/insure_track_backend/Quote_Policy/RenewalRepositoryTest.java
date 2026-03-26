package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.policy.entity.Renewal;
import com.insuretrack.policy.repository.RenewalRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
        import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RenewalRepositoryTest {

    @Mock
    private RenewalRepository renewalRepository;

    @Test
    void testFindByPolicyPolicyId() {
        // Arrange
        Long policyId = 101L;
        Renewal mockRenewal = new Renewal();
        List<Renewal> mockList = Collections.singletonList(mockRenewal);

        when(renewalRepository.findByPolicyPolicyId(policyId)).thenReturn(mockList);

        // Act
        List<Renewal> result = renewalRepository.findByPolicyPolicyId(policyId);

        // Assert

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());

        // Verify the interaction
        verify(renewalRepository, times(1)).findByPolicyPolicyId(policyId);
    }
}