package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.EquipmentRequest;
import com.example.coplaybackend.Entities.Marketplace.Equipment;
import com.example.coplaybackend.Repositories.Marketplace.EquipmentRepository;
import com.example.coplaybackend.Services.Messaging.FileStorageService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final FileStorageService fileStorageService;

    public Equipment create(EquipmentRequest req) {
        String sellerId = SecurityUtils.getCurrentUserId();
        Equipment e = Equipment.builder()
                .sellerId(sellerId)
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .rentalPricePerDay(req.getRentalPricePerDay())
                .category(req.getCategory())
                .sport(req.getSport())
                .brand(req.getBrand())
                .condition(req.getCondition())
                .listingType(req.getListingType() != null ? req.getListingType() : "SALE")
                .tags(req.getTags() != null ? req.getTags() : new ArrayList<>())
                .city(req.getCity())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .quantity(req.getQuantity() != null ? req.getQuantity() : 1)
                .status("AVAILABLE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return equipmentRepository.save(e);
    }

    public Equipment update(String equipmentId, EquipmentRequest req) {
        Equipment e = getById(equipmentId);
        ensureOwner(e.getSellerId());
        if (req.getName() != null) e.setName(req.getName());
        if (req.getDescription() != null) e.setDescription(req.getDescription());
        if (req.getPrice() != null) e.setPrice(req.getPrice());
        if (req.getRentalPricePerDay() != null) e.setRentalPricePerDay(req.getRentalPricePerDay());
        if (req.getCategory() != null) e.setCategory(req.getCategory());
        if (req.getSport() != null) e.setSport(req.getSport());
        if (req.getBrand() != null) e.setBrand(req.getBrand());
        if (req.getCondition() != null) e.setCondition(req.getCondition());
        if (req.getListingType() != null) e.setListingType(req.getListingType());
        if (req.getTags() != null) e.setTags(req.getTags());
        if (req.getCity() != null) e.setCity(req.getCity());
        if (req.getLatitude() != null) e.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) e.setLongitude(req.getLongitude());
        if (req.getQuantity() != null) e.setQuantity(req.getQuantity());
        e.setUpdatedAt(LocalDateTime.now());
        return equipmentRepository.save(e);
    }

    public void delete(String equipmentId) {
        Equipment e = getById(equipmentId);
        ensureOwner(e.getSellerId());
        e.setDeleted(true);
        e.setStatus("INACTIVE");
        e.setUpdatedAt(LocalDateTime.now());
        equipmentRepository.save(e);
    }

    public Equipment getById(String equipmentId) {
        return equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipement introuvable : " + equipmentId));
    }

    public Equipment getAndIncrementViews(String equipmentId) {
        Equipment e = getById(equipmentId);
        if (Boolean.TRUE.equals(e.getDeleted())) throw new RuntimeException("Equipement supprimé");
        e.setViews((e.getViews() == null ? 0 : e.getViews()) + 1);
        return equipmentRepository.save(e);
    }

    public Page<Equipment> list(int page, int size) {
        return equipmentRepository.findByDeletedFalse(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public List<Equipment> listBySeller(String sellerId) {
        return equipmentRepository.findBySellerIdAndDeletedFalse(sellerId);
    }

    public Equipment uploadImage(String equipmentId, MultipartFile file) throws IOException {
        Equipment e = getById(equipmentId);
        ensureOwner(e.getSellerId());
        String ref = fileStorageService.storeFile(file);
        e.getImages().add(ref);
        e.setUpdatedAt(LocalDateTime.now());
        return equipmentRepository.save(e);
    }

    public Equipment removeImage(String equipmentId, String imageRef) {
        Equipment e = getById(equipmentId);
        ensureOwner(e.getSellerId());
        e.getImages().removeIf(i -> i.equals(imageRef));
        try { fileStorageService.deleteFile(imageRef); } catch (Exception ex) { log.warn("delete file failed: {}", ex.getMessage()); }
        e.setUpdatedAt(LocalDateTime.now());
        return equipmentRepository.save(e);
    }

    public Equipment updateStatus(String equipmentId, String status) {
        Equipment e = getById(equipmentId);
        ensureOwner(e.getSellerId());
        e.setStatus(status);
        e.setUpdatedAt(LocalDateTime.now());
        return equipmentRepository.save(e);
    }

    public void recomputeRating(String equipmentId, double avg, int count) {
        Equipment e = getById(equipmentId);
        e.setRating(avg);
        e.setReviewCount(count);
        equipmentRepository.save(e);
    }

    private void ensureOwner(String sellerId) {
        String me = SecurityUtils.getCurrentUserId();
        if (me == null || !me.equals(sellerId)) {
            throw new RuntimeException("Action interdite : non propriétaire");
        }
    }
}
