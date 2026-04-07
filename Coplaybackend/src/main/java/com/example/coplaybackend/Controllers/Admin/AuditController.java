package com.example.coplaybackend.Controllers.Admin;

import com.example.coplaybackend.Entities.Auth.AuditLog;
import com.example.coplaybackend.Services.Audit.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditService.getAllLogs(pageable));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<AuditLog>> getLogsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditService.getLogsByUser(userId, pageable));
    }

    @GetMapping("/module/{module}")
    public ResponseEntity<Page<AuditLog>> getLogsByModule(
            @PathVariable String module,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditService.getLogsByModule(module, pageable));
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<Page<AuditLog>> getLogsByAction(
            @PathVariable String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditService.getLogsByAction(action, pageable));
    }

    @GetMapping("/resource/{resourceType}/{resourceId}")
    public ResponseEntity<Page<AuditLog>> getLogsByResource(
            @PathVariable String resourceType,
            @PathVariable String resourceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditService.getLogsByResource(resourceType, resourceId, pageable));
    }

    @GetMapping("/date-range")
    public ResponseEntity<Page<AuditLog>> getLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditService.getLogsByDateRange(start, end, pageable));
    }

    @GetMapping("/statistics/modules")
    public ResponseEntity<List<Map<String, Object>>> getModuleStatistics() {
        return ResponseEntity.ok(auditService.getModuleStatistics());
    }

    @GetMapping("/statistics/actions")
    public ResponseEntity<List<Map<String, Object>>> getActionStatistics() {
        return ResponseEntity.ok(auditService.getActionStatistics());
    }

    @GetMapping("/statistics/failed")
    public ResponseEntity<List<AuditLog>> getFailedActions(
            @RequestParam(defaultValue = "24") int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return ResponseEntity.ok(auditService.getFailedActions(since));
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, Object>> getTotalCount() {
        Map<String, Object> response = Map.of(
                "total", auditService.getTotalLogCount()
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, String>> cleanupOldLogs(
            @RequestParam(defaultValue = "90") int daysBefore) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysBefore);
        auditService.deleteOldLogs(cutoff);
        return ResponseEntity.ok(Map.of("message", "Old logs cleaned up successfully"));
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "csv") String format) {

        LocalDateTime startDate = start != null ? start : LocalDateTime.now().minusDays(30);
        LocalDateTime endDate = end != null ? end : LocalDateTime.now();

        Pageable pageable = PageRequest.of(0, 10000);
        Page<AuditLog> logs = auditService.getLogsByDateRange(startDate, endDate, pageable);

        if ("json".equalsIgnoreCase(format)) {
            StringBuilder json = new StringBuilder("[");
            logs.getContent().forEach(log -> {
                if (json.length() > 1) json.append(",");
                json.append("{");
                json.append("\"logId\":\"").append(log.getLogId()).append("\",");
                json.append("\"actorId\":\"").append(log.getActorId()).append("\",");
                json.append("\"action\":\"").append(log.getAction()).append("\",");
                json.append("\"module\":\"").append(log.getModule()).append("\",");
                json.append("\"resourceType\":\"").append(log.getResourceType()).append("\",");
                json.append("\"resourceId\":\"").append(log.getResourceId()).append("\",");
                json.append("\"success\":").append(log.isSuccess()).append(",");
                json.append("\"performedAt\":\"").append(log.getPerformedAt()).append("\"");
                json.append("}");
            });
            json.append("]");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit_logs.json")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(json.toString());
        } else {
            StringBuilder csv = new StringBuilder("LogId,ActorId,Action,Module,ResourceType,ResourceId,Success,PerformedAt,ErrorMessage\n");
            logs.getContent().forEach(log -> {
                csv.append(log.getLogId()).append(",");
                csv.append(log.getActorId()).append(",");
                csv.append(log.getAction()).append(",");
                csv.append(log.getModule()).append(",");
                csv.append(log.getResourceType()).append(",");
                csv.append(log.getResourceId()).append(",");
                csv.append(log.isSuccess()).append(",");
                csv.append(log.getPerformedAt()).append(",");
                csv.append(log.getErrorMessage() != null ? log.getErrorMessage().replace(",", ";") : "").append("\n");
            });

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit_logs.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv.toString());
        }
    }
}