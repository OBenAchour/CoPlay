package com.example.coplaybackend.Entities.Events;

/**
 * Statut de la participation d'un joueur à un événement.
 * Gère la logique de capacité maximale et de liste d'attente.
 *
 * CONFIRMED → le joueur est dans les X premières places (maxParticipants).
 *             Priorité donnée aux joueurs avec le meilleur score de fiabilité.
 *             Si l'événement est payant → il doit payer pour rester CONFIRMED.
 *
 * WAITING   → l'événement est complet, le joueur est en liste d'attente.
 *             Si un CONFIRMED se désinscrit ou ne paie pas → le premier
 *             WAITING (meilleur score) est automatiquement promu à CONFIRMED.
 *
 * DECLINED  → le joueur a répondu NO.
 *             Score inchangé — c'est une réponse honnête et responsable.
 *
 * ABSENT    → le joueur était CONFIRMED mais ne s'est pas présenté.
 *             Validé par le capitaine après l'événement.
 *             Déclenche une pénalité sur le score de fiabilité (-10 points).
 */
public enum ParticipationStatus {
    CONFIRMED,  // place confirmée ✅
    WAITING,    // liste d'attente ⏳
    DECLINED,   // a répondu NO
    ABSENT      // no-show ❌ → pénalité score
}