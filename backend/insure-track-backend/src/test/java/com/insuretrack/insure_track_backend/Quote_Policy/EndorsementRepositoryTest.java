package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.policy.entity.Endorsement;
import com.insuretrack.policy.repository.EndorsementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EndorsementRepositoryTest {

    @Mock
    private EndorsementRepository endorsementRepository;

    @Test
    void testFindByPolicyPolicyId() {
        // Arrange
        Long policyId = 1L;
        Endorsement mockEndorsement = new Endorsement();
        // If Endorsement has a setter for ID, you can set it here
        List<Endorsement> mockList = Collections.singletonList(mockEndorsement);

        when(endorsementRepository.findByPolicyPolicyId(policyId)).thenReturn(mockList);

        // Act
        List<Endorsement> result = endorsementRepository.findByPolicyPolicyId(policyId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(endorsementRepository, times(1)).findByPolicyPolicyId(policyId);
    }
}