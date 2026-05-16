package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.SearchFilter;
import com.example.coplaybackend.Entities.Marketplace.Equipment;
import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.TextCriteria;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketplaceSearchService {

    private final MongoTemplate mongoTemplate;

    public List<Equipment> searchEquipments(SearchFilter f) {
        Query q = baseQuery(f);
        if (f.getCondition() != null) q.addCriteria(Criteria.where("condition").is(f.getCondition()));
        applyEquipmentFilters(q, f);
        applySort(q, f.getSortBy());
        applyPaging(q, f);
        return mongoTemplate.find(q, Equipment.class);
    }

    public List<MarketplaceService> searchServices(SearchFilter f) {
        Query q = baseQuery(f);
        applyServiceFilters(q, f);
        applySort(q, f.getSortBy());
        applyPaging(q, f);
        return mongoTemplate.find(q, MarketplaceService.class);
    }

    private Query baseQuery(SearchFilter f) {
        Query q = new Query();
        q.addCriteria(Criteria.where("deleted").ne(true));
        if (f.getQ() != null && !f.getQ().isBlank()) {
            q.addCriteria(TextCriteria.forDefaultLanguage().matching(f.getQ()));
        }
        if (f.getSport() != null) q.addCriteria(Criteria.where("sport").is(f.getSport()));
        if (f.getCategory() != null) q.addCriteria(Criteria.where("category").is(f.getCategory()));
        if (f.getCity() != null) q.addCriteria(Criteria.where("city").is(f.getCity()));
        return q;
    }

    private void applyEquipmentFilters(Query q, SearchFilter f) {
        if (f.getMinPrice() != null) q.addCriteria(Criteria.where("price").gte(f.getMinPrice()));
        if (f.getMaxPrice() != null) q.addCriteria(Criteria.where("price").lte(f.getMaxPrice()));
    }

    private void applyServiceFilters(Query q, SearchFilter f) {
        if (f.getMinPrice() != null) q.addCriteria(Criteria.where("price").gte(f.getMinPrice()));
        if (f.getMaxPrice() != null) q.addCriteria(Criteria.where("price").lte(f.getMaxPrice()));
    }

    private void applySort(Query q, String sortBy) {
        if (sortBy == null) { q.with(Sort.by(Sort.Direction.DESC, "createdAt")); return; }
        switch (sortBy) {
            case "price_asc" -> q.with(Sort.by(Sort.Direction.ASC, "price"));
            case "price_desc" -> q.with(Sort.by(Sort.Direction.DESC, "price"));
            case "rating" -> q.with(Sort.by(Sort.Direction.DESC, "rating"));
            case "popularity" -> q.with(Sort.by(Sort.Direction.DESC, "views"));
            default -> q.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        }
    }

    private void applyPaging(Query q, SearchFilter f) {
        int page = f.getPage() == null ? 0 : f.getPage();
        int size = f.getSize() == null ? 20 : Math.min(f.getSize(), 100);
        q.with(PageRequest.of(page, size));
    }
}
