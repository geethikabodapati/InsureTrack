package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.policy.controller.EndorsementController;
import com.insuretrack.policy.dto.EndorsementRequestDTO;
import com.insuretrack.policy.dto.EndorsementResponseDTO;
import com.insuretrack.policy.service.EndorsementService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EndorsementControllerTest {

    @Mock
    private EndorsementService endorsementService;

    @InjectMocks
    private EndorsementController endorsementController;

    @Test
    void create_ShouldReturnOkResponse_WhenServiceSucceeds() {
        // Arrange
        EndorsementRequestDTO requestDTO = new EndorsementRequestDTO();
        // Populate DTO fields if necessary

        EndorsementResponseDTO expectedResponse = new EndorsementResponseDTO();
        // Populate expected response fields if necessary

        when(endorsementService.create(any(EndorsementRequestDTO.class))).thenReturn(expectedResponse);

        // Act
        ResponseEntity<EndorsementResponseDTO> responseEntity = endorsementController.create(requestDTO);

        // Assert
        assertNotNull(responseEntity);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(expectedResponse, responseEntity.getBody());

        // Verify that the service was actually called once
        verify(endorsementService, times(1)).create(requestDTO);
    }
}
