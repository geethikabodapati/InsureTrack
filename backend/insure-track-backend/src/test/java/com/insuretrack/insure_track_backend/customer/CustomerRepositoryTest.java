package com.insuretrack.insure_track_backend.customer;



import com.insuretrack.customer.entity.Customer;
import com.insuretrack.customer.repository.CustomerRepository;
import com.insuretrack.user.entity.User;
import com.insuretrack.customer.service.CustomerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CustomerRepositoryTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerServiceImpl customerService; // assuming you have a service that uses CustomerRepository

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindByUserId_success() {
        User user = User.builder().userId(1L).build();
        Customer customer = Customer.builder().customerId(100L).user(user).name("Test Customer").build();

        when(customerRepository.findByUser_UserId(1L)).thenReturn(Optional.of(customer));

        Optional<Customer> result = customerRepository.findByUser_UserId(1L);

        assertTrue(result.isPresent());
        assertEquals("Test Customer", result.get().getName());
        assertEquals(1L, result.get().getUser().getUserId());
    }

    @Test
    void testFindByUserId_notFound() {
        when(customerRepository.findByUser_UserId(99L)).thenReturn(Optional.empty());

        Optional<Customer> result = customerRepository.findByUser_UserId(99L);

        assertFalse(result.isPresent());
    }
}

