package com.example.coplaybackend.Services.AI;

import com.example.coplaybackend.Entities.Marketplace.Equipment;
import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import com.example.coplaybackend.Repositories.Marketplace.EquipmentRepository;
import com.example.coplaybackend.Repositories.Marketplace.FavoriteRepository;
import com.example.coplaybackend.Repositories.Marketplace.MarketplaceServiceRepository;
import com.example.coplaybackend.Repositories.Marketplace.OrderRepository;
import com.example.coplaybackend.Services.Marketplace.FraudService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceAIService {

    private final AIClient aiClient;
    private final EquipmentRepository equipmentRepository;
    private final MarketplaceServiceRepository serviceRepository;
    private final FavoriteRepository favoriteRepository;
    private final OrderRepository orderRepository;
    private final FraudService fraudService;
    private final ObjectMapper mapper = new ObjectMapper();

    public List<Equipment> recommendEquipments(String userId, int limit) {
        Set<String> favSports = new HashSet<>();
        favoriteRepository.findByUserId(userId).forEach(f -> {
            if ("EQUIPMENT".equals(f.getTargetType())) {
                equipmentRepository.findById(f.getTargetId()).ifPresent(e -> { if (e.getSport() != null) favSports.add(e.getSport()); });
            }
        });
        orderRepository.findByBuyerId(userId, PageRequest.of(0, 20)).forEach(o ->
                o.getItems().forEach(i -> {
                    if ("EQUIPMENT".equals(i.getTargetType())) {
                        equipmentRepository.findById(i.getTargetId()).ifPresent(e -> { if (e.getSport() != null) favSports.add(e.getSport()); });
                    }
                }));

        List<Equipment> pool = favSports.isEmpty()
                ? equipmentRepository.findByDeletedFalse(PageRequest.of(0, 100)).getContent()
                : favSports.stream()
                    .flatMap(s -> equipmentRepository.findBySportAndDeletedFalse(s, PageRequest.of(0, 50)).stream())
                    .distinct()
                    .collect(Collectors.toList());

        return pool.stream()
                .sorted(Comparator.comparingDouble((Equipment e) -> e.getRating() == null ? 0.0 : e.getRating()).reversed()
                        .thenComparingLong(e -> e.getViews() == null ? 0L : e.getViews()).reversed())
                .limit(limit)
                .toList();
    }

    public BigDecimal estimatePrice(Equipment e) {
        String prompt = """
            Estime le prix d'un équipement sportif en EUR (uniquement le nombre, sans devise).
            Marque: %s, Catégorie: %s, État: %s, Sport: %s, Description: %s.
            Réponds UNIQUEMENT avec un nombre décimal.
            """.formatted(safe(e.getBrand()), safe(e.getCategory()), safe(e.getCondition()),
                safe(e.getSport()), safe(e.getDescription()));
        String resp = aiClient.complete(prompt);
        try {
            String num = resp == null ? "0" : resp.replaceAll("[^0-9.,]", "").replace(",", ".");
            return new BigDecimal(num);
        } catch (Exception ex) {
            log.warn("estimatePrice parse failed: {}", resp);
            return BigDecimal.ZERO;
        }
    }

    public List<MarketplaceService> matchProvidersForTeam(String teamSport, String need, int limit) {
        List<MarketplaceService> all = serviceRepository.findByDeletedFalse(PageRequest.of(0, 200)).getContent();
        if (all.isEmpty()) return all;

        String catalog = all.stream().limit(50)
                .map(s -> s.getServiceId() + " | " + s.getCategory() + " | " + s.getName() + " | " + safe(s.getDescription()))
                .collect(Collectors.joining("\n"));
        String prompt = """
            Voici un besoin: sport=%s, demande=%s.
            Voici un catalogue de prestataires (id | catégorie | nom | description):
            %s
            Renvoie UNIQUEMENT une liste JSON d'au plus %d ids classés du plus pertinent au moins.
            Format strict: ["id1","id2",...]
            """.formatted(safe(teamSport), safe(need), catalog, limit);
        String resp = aiClient.complete(prompt);
        List<String> ids = parseIdList(resp);
        return ids.stream().map(serviceRepository::findById)
                .filter(Optional::isPresent).map(Optional::get).toList();
    }

    public Map<String, Object> detectFraud(Equipment e) {
        String prompt = """
            Analyse ce listing pour détecter une fraude potentielle.
            Nom: %s, Description: %s, Prix: %s, Marque: %s, État: %s.
            Réponds STRICTEMENT en JSON: {"score":0.0_à_1.0,"reason":"..."}.
            """.formatted(safe(e.getName()), safe(e.getDescription()), e.getPrice(), safe(e.getBrand()), safe(e.getCondition()));
        String resp = aiClient.complete(prompt);
        Map<String, Object> result = parseJson(resp);
        if (result.containsKey("score")) {
            double score = ((Number) result.get("score")).doubleValue();
            if (score > 0.5) {
                fraudService.saveAiAnalysis(e.getEquipmentId(), "EQUIPMENT", score, String.valueOf(result.get("reason")));
            }
        }
        return result;
    }

    public String chatbot(String userId, String question) {
        String prompt = """
            Tu es un assistant marketplace sportive. L'utilisateur (id %s) pose la question:
            "%s"
            Réponds en français de manière concise (3-4 phrases max), donne des conseils utiles et oriente vers la recherche/comparaison de produits ou services si pertinent.
            """.formatted(userId, question);
        return aiClient.complete(prompt);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String s) {
        if (s == null) return Map.of();
        try {
            int start = s.indexOf('{');
            int end = s.lastIndexOf('}');
            if (start < 0 || end < 0) return Map.of();
            return mapper.readValue(s.substring(start, end + 1), Map.class);
        } catch (Exception e) {
            return Map.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> parseIdList(String s) {
        if (s == null) return List.of();
        try {
            int start = s.indexOf('[');
            int end = s.lastIndexOf(']');
            if (start < 0 || end < 0) return List.of();
            return mapper.readValue(s.substring(start, end + 1), List.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    private static String safe(String s) { return s == null ? "" : s; }
}
