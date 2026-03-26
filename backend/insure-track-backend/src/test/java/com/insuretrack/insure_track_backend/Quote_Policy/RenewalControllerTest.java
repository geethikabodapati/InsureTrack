package com.insuretrack.insure_track_backend.Quote_Policy;


import com.insuretrack.policy.controller.RenewalController;
import com.insuretrack.policy.dto.RenewalRequestDTO;
import com.insuretrack.policy.dto.RenewalResponseDTO;
import com.insuretrack.policy.service.RenewalService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RenewalControllerTest {

    @Mock
    private RenewalService renewalService;

    @InjectMocks
    private RenewalController renewalController;

    @Test
    void createOffer_ShouldReturnResponse() {
        // Arrange
        RenewalRequestDTO requestDTO = new RenewalRequestDTO();

        // Using Builder is safer and avoids constructor argument count errors
        RenewalResponseDTO mockResponse = RenewalResponseDTO.builder()
                .renewalId(1L)
                .policyId(500L)
                .proposedPremium(1200.50)
                .offerDate(LocalDate.now())
                .status("OFFERED")
                .build();

        when(renewalService.createOffer(any(RenewalRequestDTO.class))).thenReturn(mockResponse);

        // Act
        RenewalResponseDTO result = renewalController.createOffer(requestDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getRenewalId());
        assertEquals(500L, result.getPolicyId());
        verify(renewalService, times(1)).createOffer(requestDTO);
    }

    @Test
    void getByPolicy_ShouldReturnList() {
        // Arrange
        Long policyId = 500L;
        RenewalResponseDTO mockResponse = RenewalResponseDTO.builder()
                .renewalId(1L)
                .policyId(policyId)
                .proposedPremium(1200.50)
                .offerDate(LocalDate.now())
                .status("OFFERED")
                .build();

        List<RenewalResponseDTO> mockList = Collections.singletonList(mockResponse);

        when(renewalService.getByPolicy(policyId)).thenReturn(mockList);

        // Act
        List<RenewalResponseDTO> result = renewalController.getByPolicy(policyId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(policyId, result.get(0).getPolicyId());
        verify(renewalService, times(1)).getByPolicy(policyId);
    }
}
