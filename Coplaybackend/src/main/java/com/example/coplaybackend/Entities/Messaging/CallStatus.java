package com.example.coplaybackend.Entities.Messaging;

public enum CallStatus {
    INITIATED,      // Appel démarré
    RINGING,        // En cours de sonnerie
    ACTIVE,         // En cours
    ON_HOLD,        // En attente
    ENDED,          // Terminé
    MISSED,         // Non répondu
    DECLINED        // Refusé
}