package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.FraudReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FraudReportRepository extends MongoRepository<FraudReport, String> {

    Page<FraudReport> findByStatus(String status, Pageable pageable);

    List<FraudReport> findByTargetId(String targetId);
}
