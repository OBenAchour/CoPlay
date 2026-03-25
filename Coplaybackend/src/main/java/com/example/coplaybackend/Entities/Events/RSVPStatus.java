package com.example.coplaybackend.Entities.Events;

/**
 * Réponse d'un joueur à une invitation à un événement.
 *
 * PENDING → statut par défaut à la création de la participation.
 *           Le joueur a été invité mais n'a pas encore répondu.
 *           Permet au capitaine de voir qui n'a pas encore répondu
 *           et de les relancer.
 *
 * YES     → le joueur confirme sa présence.
 *           Déclenche le processus de paiement si l'événement est payant.
 *           Déclenche la logique de liste d'attente si l'événement est complet.
 *
 * NO      → le joueur décline honnêtement.
 *           Score inchangé — c'est une réponse responsable.
 *           Le joueur peut changer d'avis tant que l'événement est SCHEDULED.
 *
 * Pourquoi on a retiré MAYBE ?
 *  MAYBE créait de l'incertitude pour le capitaine qui ne pouvait pas
 *  organiser son équipe. YES ou NO force le joueur à s'engager clairement.
 */
public enum RSVPStatus {
    PENDING,   // pas encore répondu (défaut à l'invitation)
    YES,       // confirmé
    NO         // décliné
}