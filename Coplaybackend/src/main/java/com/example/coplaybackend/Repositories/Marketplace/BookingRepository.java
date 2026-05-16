package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    Page<Booking> findByClientId(String clientId, Pageable pageable);

    Page<Booking> findByProviderId(String providerId, Pageable pageable);

    Optional<Booking> findByPaymentIntentId(String paymentIntentId);

    @Query("{ 'targetId': ?0, 'status': { $in: ['PENDING','CONFIRMED'] }, " +
            " 'startDate': { $lt: ?2 }, 'endDate': { $gt: ?1 } }")
    List<Booking> findOverlapping(String targetId, LocalDateTime start, LocalDateTime end);

    List<Booking> findByClientIdAndTargetIdAndStatus(String clientId, String targetId, String status);
}
