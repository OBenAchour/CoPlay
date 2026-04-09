package com.example.coplaybackend.Repositories.Auth;

import com.example.coplaybackend.Entities.Auth.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    Page<AuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);

    Page<AuditLog> findByActorIdOrderByPerformedAtDesc(String actorId, Pageable pageable);

    Page<AuditLog> findByModuleOrderByPerformedAtDesc(String module, Pageable pageable);

    Page<AuditLog> findByActionOrderByPerformedAtDesc(String action, Pageable pageable);

    Page<AuditLog> findByResourceTypeAndResourceIdOrderByPerformedAtDesc(String resourceType, String resourceId, Pageable pageable);

    Page<AuditLog> findByPerformedAtBetweenOrderByPerformedAtDesc(LocalDateTime start, LocalDateTime end, Pageable pageable);

    List<AuditLog> findBySuccessFalseAndPerformedAtAfter(LocalDateTime since);

    List<AuditLog> findByPerformedAtBefore(LocalDateTime before);

    long countByModule(String module);
}