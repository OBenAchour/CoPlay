package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.Config.StripeConfig;
import com.example.coplaybackend.DTOs.Marketplace.PaymentIntentRequest;
import com.example.coplaybackend.DTOs.Marketplace.PaymentIntentResponse;
import com.example.coplaybackend.Services.Payment.StripePaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/marketplace/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final StripePaymentService stripePaymentService;
    private final StripeConfig stripeConfig;

    @PostMapping("/intent")
    public ResponseEntity<PaymentIntentResponse> createIntent(@RequestBody PaymentIntentRequest req) throws StripeException {
        if (req.getOrderId() != null) {
            return ResponseEntity.ok(stripePaymentService.createIntentForOrder(req.getOrderId()));
        }
        if (req.getBookingId() != null) {
            return ResponseEntity.ok(stripePaymentService.createIntentForBooking(req.getBookingId()));
        }
        throw new RuntimeException("orderId ou bookingId requis");
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody String payload,
                                          @RequestHeader(name = "Stripe-Signature", required = false) String sig) {
        try {
            Event event = Webhook.constructEvent(payload, sig, stripeConfig.getWebhookSecret());
            String type = event.getType();
            switch (type) {
                case "payment_intent.succeeded" -> {
                    PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElseThrow();
                    stripePaymentService.handleSucceeded(pi.getId());
                }
                case "payment_intent.payment_failed" -> {
                    PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElseThrow();
                    String reason = pi.getLastPaymentError() != null ? pi.getLastPaymentError().getMessage() : "unknown";
                    stripePaymentService.handleFailed(pi.getId(), reason);
                }
                default -> log.debug("Unhandled Stripe event: {}", type);
            }
            return ResponseEntity.ok("ok");
        } catch (SignatureVerificationException e) {
            log.error("Stripe signature verification failed", e);
            return ResponseEntity.badRequest().body("invalid signature");
        } catch (Exception e) {
            log.error("Stripe webhook error", e);
            return ResponseEntity.badRequest().body("error");
        }
    }

    @PostMapping("/refund/{paymentId}")
    public ResponseEntity<?> refund(@PathVariable String paymentId) throws StripeException {
        return ResponseEntity.ok(stripePaymentService.refund(paymentId));
    }
}
