package com.example.coplaybackend.Services.Payment;

import com.example.coplaybackend.Config.StripeConfig;
import com.example.coplaybackend.DTOs.Marketplace.PaymentIntentResponse;
import com.example.coplaybackend.Entities.Marketplace.Booking;
import com.example.coplaybackend.Entities.Marketplace.Order;
import com.example.coplaybackend.Entities.Marketplace.Payment;
import com.example.coplaybackend.Repositories.Marketplace.PaymentRepository;
import com.example.coplaybackend.Services.Marketplace.BookingService;
import com.example.coplaybackend.Services.Marketplace.OrderService;
import com.example.coplaybackend.Utils.SecurityUtils;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripePaymentService {

    private final StripeConfig stripeConfig;
    private final OrderService orderService;
    private final BookingService bookingService;
    private final PaymentRepository paymentRepository;

    public PaymentIntentResponse createIntentForOrder(String orderId) throws StripeException {
        Order order = orderService.getById(orderId);
        long amountCents = toCents(order.getTotalAmount());
        Map<String, String> metadata = new HashMap<>();
        metadata.put("orderId", orderId);
        metadata.put("buyerId", order.getBuyerId());

        PaymentIntent intent = PaymentIntent.create(PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(stripeConfig.getCurrency())
                .setAutomaticPaymentMethods(PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true).build())
                .putAllMetadata(metadata)
                .build());

        orderService.attachPaymentIntent(orderId, intent.getId());
        savePending(order.getBuyerId(), orderId, null, order.getTotalAmount(), intent.getId());
        return new PaymentIntentResponse(intent.getClientSecret(), intent.getId(), amountCents, stripeConfig.getCurrency());
    }

    public PaymentIntentResponse createIntentForBooking(String bookingId) throws StripeException {
        Booking booking = bookingService.getById(bookingId);
        long amountCents = toCents(booking.getTotalPrice());
        Map<String, String> metadata = new HashMap<>();
        metadata.put("bookingId", bookingId);
        metadata.put("clientId", booking.getClientId());

        PaymentIntent intent = PaymentIntent.create(PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(stripeConfig.getCurrency())
                .setAutomaticPaymentMethods(PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true).build())
                .putAllMetadata(metadata)
                .build());

        bookingService.attachPaymentIntent(bookingId, intent.getId());
        savePending(booking.getClientId(), null, bookingId, booking.getTotalPrice(), intent.getId());
        return new PaymentIntentResponse(intent.getClientSecret(), intent.getId(), amountCents, stripeConfig.getCurrency());
    }

    public void handleSucceeded(String paymentIntentId) {
        paymentRepository.findByProviderRef(paymentIntentId).ifPresent(p -> {
            p.setStatus("SUCCEEDED");
            p.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(p);
            if (p.getOrderId() != null) {
                try { orderService.markPaidByIntent(paymentIntentId); } catch (Exception e) { log.warn(e.getMessage()); }
            }
            if (p.getBookingId() != null) {
                try { bookingService.markPaidByIntent(paymentIntentId); } catch (Exception e) { log.warn(e.getMessage()); }
            }
        });
    }

    public void handleFailed(String paymentIntentId, String reason) {
        paymentRepository.findByProviderRef(paymentIntentId).ifPresent(p -> {
            p.setStatus("FAILED");
            p.setFailureReason(reason);
            p.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(p);
        });
    }

    public Payment refund(String paymentId) throws StripeException {
        Payment p = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Paiement introuvable"));
        Refund refund = Refund.create(RefundCreateParams.builder()
                .setPaymentIntent(p.getProviderRef())
                .build());
        if ("succeeded".equalsIgnoreCase(refund.getStatus())) {
            p.setStatus("REFUNDED");
            p.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(p);
            if (p.getOrderId() != null) orderService.updateStatus(p.getOrderId(), "REFUNDED");
        }
        return p;
    }

    private void savePending(String userId, String orderId, String bookingId, BigDecimal amount, String intentId) {
        paymentRepository.save(Payment.builder()
                .userId(userId != null ? userId : SecurityUtils.getCurrentUserId())
                .orderId(orderId)
                .bookingId(bookingId)
                .amount(amount)
                .currency(stripeConfig.getCurrency())
                .provider("STRIPE")
                .providerRef(intentId)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());
    }

    private long toCents(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).movePointRight(2).longValueExact();
    }
}
