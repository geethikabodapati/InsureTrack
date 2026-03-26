package com.insuretrack.insure_track_backend.Quote_Policy;

import com.insuretrack.policy.controller.CancellationController;
import com.insuretrack.policy.dto.CancellationRequestDTO;
import com.insuretrack.policy.dto.CancellationResponseDTO;
import com.insuretrack.policy.service.CancellationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class CancellationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CancellationService cancellationService;

    @InjectMocks
    private CancellationController cancellationController;

    @BeforeEach
    void setUp() {
        // Setup MockMvc without extra configuration
        mockMvc = MockMvcBuilders.standaloneSetup(cancellationController).build();
    }

    @Test
    @DisplayName("POST /api/customer/cancellation - Success")
    void cancel_Returns200() throws Exception {
        // 1. Manually write the JSON string to avoid ObjectMapper issues
        String jsonRequest = "{\"policyId\": 1, \"reason\": \"High premium\"}";

        CancellationResponseDTO response = CancellationResponseDTO.builder()
                .cancellationId(101L)
                .policyId(1L)
                .reason("High premium")
                .effectiveDate(LocalDate.now()) // Mockito will return this object
                .build();

        when(cancellationService.cancel(any(CancellationRequestDTO.class))).thenReturn(response);

        // 2. Act & Assert
        mockMvc.perform(post("/api/customer/cancellation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cancellationId").value(101L))
                .andExpect(jsonPath("$.reason").value("High premium"))
                .andExpect(jsonPath("$.effectiveDate").exists()); // Just check it exists
    }

    @Test
    @DisplayName("GET /api/customer/cancellation/policy/{id} - Success")
    void getByPolicy_ReturnsList() throws Exception {
        CancellationResponseDTO response = CancellationResponseDTO.builder()
                .cancellationId(101L)
                .policyId(1L)
                .reason("Testing")
                .build();

        when(cancellationService.getByPolicy(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/customer/cancellation/policy/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].cancellationId").value(101L));
    }
}