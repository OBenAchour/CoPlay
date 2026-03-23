package com.example.coplaybackend.Entities.Events;

/**
 * Statut du paiement d'un joueur pour un événement payant.
 *
 * NOT_REQUIRED → l'événement est gratuit, aucun paiement nécessaire.
 *
 * PENDING      → le joueur a répondu YES mais n'a pas encore payé.
 *                Il dispose du délai défini par le capitaine (paymentDeadlineHours)
 *                pour effectuer son paiement via Flouci.
 *
 * PAID         → paiement confirmé par Flouci.
 *                Le joueur passe de WAITING à CONFIRMED.
 *
 * EXPIRED      → le joueur n'a pas payé dans le délai imparti.
 *                Sa place est libérée automatiquement.
 *                Son score de fiabilité est pénalisé.
 *                Le prochain joueur en WAITING est notifié.
 *
 * REFUNDED     → l'événement a été annulé par le capitaine.
 *                Tous les joueurs ayant le statut PAID sont remboursés
 *                automatiquement via Flouci.
 */
public enum PaymentStatus {
    NOT_REQUIRED,  // événement gratuit
    PENDING,       // en attente de paiement
    PAID,          // paiement confirmé ✅
    EXPIRED,       // délai dépassé ❌
    REFUNDED       // remboursé suite à annulation
}