package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.NegotiationRequest;
import com.example.coplaybackend.Entities.Marketplace.Negotiation;
import com.example.coplaybackend.Repositories.Marketplace.NegotiationRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NegotiationService {

    private final NegotiationRepository negotiationRepository;
    private final EquipmentService equipmentService;
    private final ProviderServiceService providerServiceService;

    public Negotiation startOrGet(NegotiationRequest req) {
        String buyerId = SecurityUtils.getCurrentUserId();
        return negotiationRepository.findByTargetIdAndBuyerId(req.getTargetId(), buyerId)
                .orElseGet(() -> {
                    String sellerId = resolveSeller(req.getTargetId(), req.getTargetType());
                    return negotiationRepository.save(Negotiation.builder()
                            .targetId(req.getTargetId())
                            .targetType(req.getTargetType())
                            .buyerId(buyerId)
                            .sellerId(sellerId)
                            .lastOfferedPrice(req.getProposedPrice())
                            .lastOfferBy("BUYER")
                            .status("OPEN")
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build());
                });
    }

    public Negotiation propose(String negotiationId, java.math.BigDecimal price) {
        Negotiation n = getById(negotiationId);
        String me = SecurityUtils.getCurrentUserId();
        if (!me.equals(n.getBuyerId()) && !me.equals(n.getSellerId())) {
            throw new RuntimeException("Action interdite");
        }
        n.setLastOfferedPrice(price);
        n.setLastOfferBy(me.equals(n.getBuyerId()) ? "BUYER" : "SELLER");
        n.setUpdatedAt(LocalDateTime.now());
        return negotiationRepository.save(n);
    }

    public Negotiation accept(String negotiationId) {
        Negotiation n = getById(negotiationId);
        n.setStatus("ACCEPTED");
        n.setUpdatedAt(LocalDateTime.now());
        return negotiationRepository.save(n);
    }

    public Negotiation reject(String negotiationId) {
        Negotiation n = getById(negotiationId);
        n.setStatus("REJECTED");
        n.setUpdatedAt(LocalDateTime.now());
        return negotiationRepository.save(n);
    }

    public List<Negotiation> listMineAsBuyer() {
        return negotiationRepository.findByBuyerId(SecurityUtils.getCurrentUserId());
    }

    public List<Negotiation> listMineAsSeller() {
        return negotiationRepository.findBySellerId(SecurityUtils.getCurrentUserId());
    }

    public Negotiation attachConversation(String negotiationId, String conversationId) {
        Negotiation n = getById(negotiationId);
        n.setConversationId(conversationId);
        n.setUpdatedAt(LocalDateTime.now());
        return negotiationRepository.save(n);
    }

    private Negotiation getById(String id) {
        return negotiationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Négociation introuvable"));
    }

    private String resolveSeller(String targetId, String targetType) {
        if ("EQUIPMENT".equals(targetType)) return equipmentService.getById(targetId).getSellerId();
        if ("SERVICE".equals(targetType)) return providerServiceService.getById(targetId).getProviderId();
        throw new RuntimeException("targetType invalide");
    }
}
