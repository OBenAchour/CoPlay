package com.example.coplaybackend.Repositories.Auth;

import com.example.coplaybackend.Entities.Auth.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;

// AuditLogRepository.java
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
}
