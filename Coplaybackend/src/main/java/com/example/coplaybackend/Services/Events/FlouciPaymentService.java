package com.example.coplaybackend.Services.Events;

import com.example.coplaybackend.DTOs.Events.FlouciInitResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Intégration de la passerelle de paiement Flouci (API v2).
 *
 * Flux :
 *  1. generatePayment(...)  → POST /generate_payment  → renvoie {link, payment_id}
 *  2. l'utilisateur paie sur la page Flouci (link)
 *  3. verifyPayment(id)     → GET  /verify_payment/{id} → status == "SUCCESS"
 *
 * Authentification : header  Authorization: Bearer <PUBLIC>:<SECRET>
 * Montant : exprimé en millimes (1 DT = 1000 millimes).
 *
 * Les jetons sont lus depuis la configuration / variables d'environnement
 * (flouci.public-token / flouci.private-token), avec des valeurs par défaut
 * vides → pas besoin de modifier la config globale. En mode test, renseignez :
 *   - FLOUCI_PUBLIC_TOKEN
 *   - FLOUCI_PRIVATE_TOKEN
 * (ou les propriétés flouci.public-token / flouci.private-token).
 */
@Service
@Slf4j
public class FlouciPaymentService {

    @Value("${flouci.public-token:${FLOUCI_PUBLIC_TOKEN:}}")
    private String publicToken;

    @Value("${flouci.private-token:${FLOUCI_PRIVATE_TOKEN:}}")
    private String privateToken;

    @Value("${flouci.base-url:https://developers.flouci.com/api/v2}")
    private String baseUrl;

    @Value("${flouci.session-timeout-secs:1200}")
    private int sessionTimeoutSecs;

    private final RestTemplate rest = new RestTemplate();

    /** Vrai si les jetons Flouci sont configurés (sinon, paiement Flouci indisponible). */
    public boolean isConfigured() {
        return publicToken != null && !publicToken.isBlank()
                && privateToken != null && !privateToken.isBlank();
    }

    /**
     * Crée une transaction de paiement Flouci.
     *
     * @param amountDT     montant en dinars (sera converti en millimes)
     * @param successLink  URL de redirection après succès
     * @param failLink     URL de redirection après échec
     * @param trackingId   identifiant interne (ex. participationId) pour traçabilité
     */
    @SuppressWarnings("unchecked")
    public FlouciInitResponse generatePayment(double amountDT, String successLink,
                                              String failLink, String trackingId) {
        if (!isConfigured()) {
            throw new IllegalStateException(
                    "Paiement Flouci indisponible : jetons non configurés (flouci.public-token / flouci.private-token).");
        }

        long millimes = Math.round(amountDT * 1000.0);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", String.valueOf(millimes));
        body.put("success_link", successLink);
        body.put("fail_link", failLink);
        body.put("developer_tracking_id", trackingId);
        body.put("accept_card", true);
        body.put("session_timeout_secs", sessionTimeoutSecs);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + publicToken + ":" + privateToken);

        try {
            ResponseEntity<Map> resp = rest.exchange(
                    baseUrl + "/generate_payment",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class);

            Map<String, Object> result = (Map<String, Object>) resp.getBody().get("result");
            if (result == null) {
                throw new IllegalStateException("Réponse Flouci invalide (pas de 'result').");
            }
            String link = (String) result.get("link");
            String paymentId = (String) result.get("payment_id");
            return FlouciInitResponse.builder().link(link).paymentId(paymentId).build();

        } catch (Exception e) {
            log.error("[Flouci] Échec generate_payment : {}", e.getMessage());
            throw new IllegalStateException("Échec de l'initiation du paiement Flouci : " + e.getMessage());
        }
    }

    /**
     * Vérifie l'état d'un paiement Flouci.
     * @return true si le paiement est confirmé (status == SUCCESS).
     */
    @SuppressWarnings("unchecked")
    public boolean verifyPayment(String paymentId) {
        if (!isConfigured() || paymentId == null || paymentId.isBlank()) {
            return false;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + publicToken + ":" + privateToken);

        try {
            ResponseEntity<Map> resp = rest.exchange(
                    baseUrl + "/verify_payment/" + paymentId,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class);

            Map<String, Object> bodyMap = resp.getBody();
            if (bodyMap == null || !Boolean.TRUE.equals(bodyMap.get("success"))) {
                return false;
            }
            Map<String, Object> result = (Map<String, Object>) bodyMap.get("result");
            return result != null && "SUCCESS".equals(result.get("status"));

        } catch (Exception e) {
            log.error("[Flouci] Échec verify_payment : {}", e.getMessage());
            return false;
        }
    }
}
