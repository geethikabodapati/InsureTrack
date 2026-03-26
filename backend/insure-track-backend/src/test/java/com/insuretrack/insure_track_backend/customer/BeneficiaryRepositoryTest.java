package com.insuretrack.insure_track_backend.customer;
import com.insuretrack.customer.entity.Beneficiary;
import com.insuretrack.customer.entity.Customer;
import com.insuretrack.customer.repository.BeneficiaryRepository;
import com.insuretrack.customer.service.CustomerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BeneficiaryRepositoryTest {

    @Mock
    private BeneficiaryRepository beneficiaryRepository;

    @InjectMocks
    private CustomerServiceImpl customerService; // assuming service uses BeneficiaryRepository

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindByCustomerId_success() {
        Customer customer = Customer.builder().customerId(1L).name("Test Customer").build();
        Beneficiary beneficiary = Beneficiary.builder().beneficiaryId(100L).customer(customer).name("John Doe").build();

        when(beneficiaryRepository.findByCustomer_CustomerId(1L))
                .thenReturn(List.of(beneficiary));

        List<Beneficiary> results = beneficiaryRepository.findByCustomer_CustomerId(1L);

        assertEquals(1, results.size());
        assertEquals("John Doe", results.get(0).getName());
        assertEquals(1L, results.get(0).getCustomer().getCustomerId());
    }

    @Test
    void testFindByCustomerId_emptyList() {
        when(beneficiaryRepository.findByCustomer_CustomerId(99L))
                .thenReturn(List.of());

        List<Beneficiary> results = beneficiaryRepository.findByCustomer_CustomerId(99L);

        assertTrue(results.isEmpty());
    }
}

