package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    Optional<Payment> findByProviderRef(String providerRef);

    List<Payment> findByOrderId(String orderId);

    List<Payment> findByBookingId(String bookingId);

    List<Payment> findByUserId(String userId);
}
