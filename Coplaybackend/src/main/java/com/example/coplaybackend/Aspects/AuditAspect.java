package com.example.coplaybackend.Aspects;

import com.example.coplaybackend.Annotations.Auditable;
import com.example.coplaybackend.Services.Audit.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditService auditService;

    @Around("@annotation(auditable)")
    public Object auditAction(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String userId = extractUserId(joinPoint);
        String resourceId = extractResourceId(joinPoint);
        String action = auditable.action();
        String module = auditable.module();
        String resourceType = auditable.resourceType();

        Map<String, Object> newValue = extractParameters(joinPoint);
        boolean success = true;
        String errorMessage = null;
        Object result = null;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            success = false;
            errorMessage = e.getMessage();
            throw e;
        } finally {
            if (userId != null) {
                auditService.logAction(userId, action, module, resourceType, resourceId, null, newValue, success, errorMessage);
            }
        }
    }

    private String extractUserId(ProceedingJoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        for (Object arg : args) {
            if (arg instanceof String) {
                String str = (String) arg;
                if (str.matches("[a-f0-9\\-]{36}")) {
                    return str;
                }
            }
        }
        return null;
    }

    private String extractResourceId(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();

        for (int i = 0; i < paramNames.length; i++) {
            if (paramNames[i].contains("Id") || paramNames[i].contains("id")) {
                Object arg = joinPoint.getArgs()[i];
                if (arg instanceof String) {
                    return (String) arg;
                }
            }
        }
        return null;
    }

    private Map<String, Object> extractParameters(ProceedingJoinPoint joinPoint) {
        Map<String, Object> params = new HashMap<>();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < paramNames.length; i++) {
            if (args[i] != null && isPrimitiveOrString(args[i])) {
                params.put(paramNames[i], args[i].toString());
            }
        }
        return params;
    }

    private boolean isPrimitiveOrString(Object obj) {
        return obj instanceof String || obj instanceof Number || obj instanceof Boolean;
    }
}