package com.example.coplaybackend.DTOs.Marketplace;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private String targetId;
    private String targetType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String notes;
}
