package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.BookingRequest;
import com.example.coplaybackend.Entities.Marketplace.Booking;
import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import com.example.coplaybackend.Repositories.Marketplace.BookingRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ProviderServiceService providerServiceService;
    private final EquipmentService equipmentService;
    private final SimpMessagingTemplate messagingTemplate;

    public Booking create(BookingRequest req) {
        String clientId = SecurityUtils.getCurrentUserId();
        if (req.getStartDate() == null || req.getEndDate() == null
                || !req.getEndDate().isAfter(req.getStartDate())) {
            throw new RuntimeException("Dates invalides");
        }
        List<Booking> overlap = bookingRepository.findOverlapping(req.getTargetId(),
                req.getStartDate(), req.getEndDate());
        if (!overlap.isEmpty()) {
            throw new RuntimeException("Créneau déjà réservé");
        }

        BigDecimal total;
        String providerId;
        if ("SERVICE".equals(req.getTargetType()) || "COACH_SESSION".equals(req.getTargetType())) {
            MarketplaceService s = providerServiceService.getById(req.getTargetId());
            providerId = s.getProviderId();
            long hours = Math.max(1, Duration.between(req.getStartDate(), req.getEndDate()).toHours());
            total = "FIXED".equals(s.getPricingModel())
                    ? s.getPrice()
                    : s.getPrice().multiply(BigDecimal.valueOf(hours));
        } else if ("EQUIPMENT_RENT".equals(req.getTargetType())) {
            var e = equipmentService.getById(req.getTargetId());
            providerId = e.getSellerId();
            long days = Math.max(1, Duration.between(req.getStartDate(), req.getEndDate()).toDays());
            BigDecimal daily = e.getRentalPricePerDay() != null ? e.getRentalPricePerDay() : e.getPrice();
            total = daily.multiply(BigDecimal.valueOf(days));
        } else {
            throw new RuntimeException("targetType non supporté : " + req.getTargetType());
        }

        Booking b = Booking.builder()
                .clientId(clientId)
                .providerId(providerId)
                .targetId(req.getTargetId())
                .targetType(req.getTargetType())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .totalPrice(total)
                .currency("EUR")
                .status("PENDING")
                .notes(req.getNotes())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        Booking saved = bookingRepository.save(b);
        notify(providerId, "BOOKING_NEW", saved.getBookingId());
        return saved;
    }

    public Page<Booking> listMine(int page, int size) {
        return bookingRepository.findByClientId(SecurityUtils.getCurrentUserId(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public Page<Booking> listAsProvider(int page, int size) {
        return bookingRepository.findByProviderId(SecurityUtils.getCurrentUserId(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public Booking updateStatus(String bookingId, String status) {
        Booking b = getById(bookingId);
        String me = SecurityUtils.getCurrentUserId();
        if (!Objects.equals(me, b.getProviderId()) && !Objects.equals(me, b.getClientId())) {
            throw new RuntimeException("Action interdite");
        }
        b.setStatus(status);
        b.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(b);
        notify(b.getClientId(), "BOOKING_" + status, b.getBookingId());
        notify(b.getProviderId(), "BOOKING_" + status, b.getBookingId());
        return saved;
    }

    public Booking getById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable"));
    }

    public Booking attachPaymentIntent(String bookingId, String paymentIntentId) {
        Booking b = getById(bookingId);
        b.setPaymentIntentId(paymentIntentId);
        b.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(b);
    }

    public Booking markPaidByIntent(String paymentIntentId) {
        Booking b = bookingRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Réservation Stripe introuvable"));
        b.setStatus("CONFIRMED");
        b.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(b);
        notify(b.getClientId(), "BOOKING_CONFIRMED", b.getBookingId());
        notify(b.getProviderId(), "BOOKING_CONFIRMED", b.getBookingId());
        return saved;
    }

    private void notify(String userId, String type, String id) {
        if (userId == null) return;
        messagingTemplate.convertAndSend("/queue/user-" + userId + "/marketplace",
                (Object) Map.of("type", type, "bookingId", id));
    }
}
