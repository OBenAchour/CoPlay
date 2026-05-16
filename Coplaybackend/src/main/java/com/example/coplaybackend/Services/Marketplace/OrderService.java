package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.OrderRequest;
import com.example.coplaybackend.Entities.Marketplace.*;
import com.example.coplaybackend.Repositories.Marketplace.CartRepository;
import com.example.coplaybackend.Repositories.Marketplace.OrderRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final EquipmentService equipmentService;
    private final ProviderServiceService providerServiceService;
    private final SimpMessagingTemplate messagingTemplate;

    public Order createFromCart(OrderRequest req) {
        String userId = SecurityUtils.getCurrentUserId();
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Panier vide"));
        if (cart.getItems().isEmpty()) throw new RuntimeException("Panier vide");

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = cart.getItems().stream().map(ci -> {
            String sellerId = resolveSellerId(ci);
            return OrderItem.builder()
                    .targetId(ci.getTargetId())
                    .targetType(ci.getTargetType())
                    .name(ci.getName())
                    .imageUrl(ci.getImageUrl())
                    .quantity(ci.getQuantity())
                    .unitPrice(ci.getUnitPrice())
                    .sellerId(sellerId)
                    .build();
        }).toList();

        for (OrderItem oi : orderItems) {
            total = total.add(oi.getUnitPrice().multiply(BigDecimal.valueOf(oi.getQuantity())));
        }

        Order order = Order.builder()
                .buyerId(userId)
                .items(orderItems)
                .totalAmount(total)
                .currency("EUR")
                .status("PENDING")
                .paymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "STRIPE")
                .shippingAddress(req.getShippingAddress())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Order saved = orderRepository.save(order);
        // Vider le panier après création de la commande (paiement à confirmer ensuite)
        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
        return saved;
    }

    public Order getById(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Commande introuvable : " + orderId));
    }

    public Page<Order> listMine(int page, int size) {
        return orderRepository.findByBuyerId(SecurityUtils.getCurrentUserId(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public Page<Order> listMySales(int page, int size) {
        return orderRepository.findBySellerId(SecurityUtils.getCurrentUserId(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public Order updateStatus(String orderId, String status) {
        Order o = getById(orderId);
        o.setStatus(status);
        o.setUpdatedAt(LocalDateTime.now());
        Order saved = orderRepository.save(o);
        messagingTemplate.convertAndSend("/queue/user-" + o.getBuyerId() + "/marketplace",
                (Object) Map.of("type", "ORDER_STATUS", "orderId", o.getOrderId(), "status", status));
        return saved;
    }

    public Order cancel(String orderId) {
        Order o = getById(orderId);
        if (!Objects.equals(o.getBuyerId(), SecurityUtils.getCurrentUserId())) {
            throw new RuntimeException("Action interdite");
        }
        if (!"PENDING".equals(o.getStatus())) {
            throw new RuntimeException("Cette commande ne peut plus être annulée");
        }
        return updateStatus(orderId, "CANCELLED");
    }

    public Order markPaidByIntent(String paymentIntentId) {
        Order o = orderRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Commande Stripe introuvable"));
        o.setStatus("PAID");
        o.setUpdatedAt(LocalDateTime.now());
        Order saved = orderRepository.save(o);
        // Marquer les équipements vendus
        o.getItems().stream()
                .filter(i -> "EQUIPMENT".equals(i.getTargetType()))
                .forEach(i -> {
                    try { equipmentService.updateStatus(i.getTargetId(), "SOLD"); } catch (Exception ignored) {}
                });
        messagingTemplate.convertAndSend("/queue/user-" + o.getBuyerId() + "/marketplace",
                (Object) Map.of("type", "ORDER_PAID", "orderId", o.getOrderId()));
        return saved;
    }

    public Order attachPaymentIntent(String orderId, String paymentIntentId) {
        Order o = getById(orderId);
        o.setPaymentIntentId(paymentIntentId);
        o.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(o);
    }

    private String resolveSellerId(CartItem ci) {
        try {
            if ("EQUIPMENT".equals(ci.getTargetType())) {
                return equipmentService.getById(ci.getTargetId()).getSellerId();
            }
            if ("SERVICE".equals(ci.getTargetType())) {
                return providerServiceService.getById(ci.getTargetId()).getProviderId();
            }
        } catch (Exception ignored) {}
        return null;
    }
}
