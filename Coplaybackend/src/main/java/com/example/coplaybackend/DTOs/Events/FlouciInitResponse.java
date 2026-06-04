package com.example.coplaybackend.DTOs.Events;

import lombok.*;

/**
 * Réponse renvoyée au frontend après l'initiation d'un paiement Flouci.
 *  - link      : URL de la page de paiement Flouci (vers laquelle rediriger l'utilisateur)
 *  - paymentId : identifiant de la transaction Flouci (stocké côté participation)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlouciInitResponse {
    private String link;
    private String paymentId;
}
