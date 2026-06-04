package com.example.coplaybackend.Services.Events;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Active la planification Spring (@Scheduled) pour le module Events & Training.
 *
 * Placé dans le package Services/Events (périmètre du module) afin de ne pas
 * modifier la configuration globale. Permet l'exécution automatique de
 * EventService.expireOverduePayments() (expiration des paiements en retard).
 */
@Configuration
@EnableScheduling
public class EventSchedulingConfig {
}
