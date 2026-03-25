package com.insuretrack.quote.repository;

import com.insuretrack.quote.entity.Quote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuoteRepository extends JpaRepository<Quote,Long> {
    List<Quote> findByCustomer_CustomerId(Long customerId);
}
