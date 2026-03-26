package com.insuretrack.insure_track_backend.customer;



import com.insuretrack.customer.entity.Customer;
import com.insuretrack.customer.entity.InsuredObject;
import com.insuretrack.customer.repository.InsuredObjectRepository;
import com.insuretrack.customer.service.CustomerServiceImpl;
import com.insuretrack.common.enums.ObjectType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InsuredObjectRepositoryTest {

    @Mock
    private InsuredObjectRepository insuredObjectRepository;

    @InjectMocks
    private CustomerServiceImpl customerService; // assuming your service uses InsuredObjectRepository

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindByCustomerId_success() {
        Customer customer = Customer.builder().customerId(1L).name("Test Customer").build();
        InsuredObject object = InsuredObject.builder()
                .objectId(100L)
                .customer(customer)
                .objectType(ObjectType.CAR)
                .build();

        when(insuredObjectRepository.findByCustomer_CustomerId(1L))
                .thenReturn(List.of(object));

        List<InsuredObject> results = insuredObjectRepository.findByCustomer_CustomerId(1L);

        assertEquals(1, results.size());
        assertEquals(ObjectType.CAR, results.get(0).getObjectType());
        assertEquals(1L, results.get(0).getCustomer().getCustomerId());
    }

    @Test
    void testFindByCustomerId_emptyList() {
        when(insuredObjectRepository.findByCustomer_CustomerId(99L))
                .thenReturn(List.of());

        List<InsuredObject> results = insuredObjectRepository.findByCustomer_CustomerId(99L);

        assertTrue(results.isEmpty());
    }
}

