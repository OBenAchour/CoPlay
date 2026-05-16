package com.example.coplaybackend.DTOs.Marketplace;

import lombok.Data;

import java.util.List;

@Data
public class ReviewRequest {
    private String targetId;
    private String targetType;
    private Integer rating;
    private String comment;
    private List<String> images;
}
