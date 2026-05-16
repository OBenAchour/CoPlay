package com.example.coplaybackend.Services.Marketplace.Impl;

import com.example.coplaybackend.Entities.Marketplace.Equipment;
import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import com.example.coplaybackend.Entities.Marketplace.Order;
import com.example.coplaybackend.Repositories.Marketplace.EquipmentRepository;
import com.example.coplaybackend.Repositories.Marketplace.MarketplaceServiceRepository;
import com.example.coplaybackend.Repositories.Marketplace.OrderRepository;
import com.example.coplaybackend.Services.Marketplace.OrderService;
import com.example.coplaybackend.Services.Teams.CoachingSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository repository;
    private final EquipmentRepository equipmentRepository;
    private final MarketplaceServiceRepository serviceRepository;
    private final CoachingSessionService coachingSessionService;

    @Override
    public Order create(String buyerId, String targetId, String targetType) {

        BigDecimal amount;
        if ("EQUIPMENT".equals(targetType)) {
            Equipment eq = equipmentRepository.findById(targetId).orElseThrow();
            amount = eq.getPrice();
        } else if ("SERVICE".equals(targetType)) {
            MarketplaceService s = serviceRepository.findById(targetId).orElseThrow();
            amount = s.getPrice();
        } else {
            throw new IllegalArgumentException("Invalid order targetType: " + targetType);
        }

        Order order = Order.builder()
                .buyerId(buyerId)
                .targetId(targetId)
                .targetType(targetType)
                .amount(amount)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return repository.save(order);
    }

    @Override
    public Order markPaid(String orderId) {
        Order order = repository.findById(orderId).orElseThrow();
        order.setStatus("PAID");
        order.setPaidAt(LocalDateTime.now());
        Order saved = repository.save(order);

        if ("SERVICE".equals(order.getTargetType())) {
            MarketplaceService s = serviceRepository.findById(order.getTargetId()).orElseThrow();
            if ("COACHING_SESSION".equals(s.getCategory())) {
                coachingSessionService.createFromPaidService(
                        s.getProviderId(),
                        order.getBuyerId(),
                        s.getServiceId()
                );
            }
        } else if ("EQUIPMENT".equals(order.getTargetType())) {
            Equipment eq = equipmentRepository.findById(order.getTargetId()).orElseThrow();
            if (eq.getStock() != null && eq.getStock() > 0) {
                eq.setStock(eq.getStock() - 1);
                if (eq.getStock() == 0) eq.setStatus("SOLD");
                equipmentRepository.save(eq);
            }
        }

        return saved;
    }

    @Override
    public Order cancel(String orderId) {
        Order order = repository.findById(orderId).orElseThrow();
        order.setStatus("CANCELLED");
        return repository.save(order);
    }

    @Override
    public Order complete(String orderId) {
        Order order = repository.findById(orderId).orElseThrow();
        order.setStatus("COMPLETED");
        return repository.save(order);
    }

    @Override
    public Order getById(String orderId) {
        return repository.findById(orderId).orElseThrow();
    }

    @Override
    public List<Order> listByBuyer(String buyerId) {
        return repository.findByBuyerId(buyerId);
    }

    @Override
    public List<Order> listByTarget(String targetId, String targetType) {
        return repository.findByTargetIdAndTargetType(targetId, targetType);
    }
}
