package com.example.coplaybackend.Controllers.Events;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Events.*;
import com.example.coplaybackend.Repositories.Events.EventRepository;
import com.example.coplaybackend.Repositories.Events.UserRepository;
import com.example.coplaybackend.Services.Events.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ⚠️ NOTE D'INTÉGRATION :
 * UserRepository est temporairement importé depuis Repositories.Events.
 * Lors de l'intégration avec le module Auth :
 *  → Remplacer : import com.example.coplaybackend.Repositories.Events.UserRepository;
 *  → Par       : import com.example.coplaybackend.Repositories.Auth.UserRepository;
 */
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;   // ⚠️ temporaire

    // ── Méthodes utilitaires ───────────────────────────────────────

    /**
     * Charge un Event depuis MongoDB par son ID.
     * Lève une exception si introuvable.
     */
    private Event findEventOrThrow(String eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement introuvable : " + eventId));
    }

    /**
     * Charge un User depuis MongoDB par son ID.
     * Lève une exception si introuvable.
     */
    private User findUserOrThrow(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + userId));
    }

    // ═══════════════════════════════════════════════════════════════
    //  ÉVÉNEMENTS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Crée un nouvel événement.
     * POST /api/events/add
     * US-024 / US-026
     */
    @PostMapping("/add")
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Event created = eventService.createEvent(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Modifie un événement existant.
     * PUT /api/events/update/{eventId}
     * US-027
     */
    @PutMapping("/update/{eventId}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable String eventId,
            @RequestBody Event updatedData) {
        return ResponseEntity.ok(eventService.updateEvent(eventId, updatedData));
    }

    /**
     * Annule un événement.
     * DELETE /api/events/delete/{eventId}
     * US-028
     */
    @DeleteMapping("/delete/{eventId}")
    public ResponseEntity<Void> cancelEvent(@PathVariable String eventId) {
        eventService.cancelEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retourne tous les événements d'une équipe.
     * GET /api/events/get/team/{teamId}
     * US-032
     */
    @GetMapping("/get/team/{teamId}")
    public ResponseEntity<List<Event>> getEventsByTeam(@PathVariable String teamId) {
        return ResponseEntity.ok(eventService.getEventsByTeam(teamId));
    }

    /**
     * Retourne les événements d'une équipe filtrés par statut.
     * GET /api/events/get/team/{teamId}/status/{status}
     */
    @GetMapping("/get/team/{teamId}/status/{status}")
    public ResponseEntity<List<Event>> getEventsByTeamAndStatus(
            @PathVariable String teamId,
            @PathVariable EventStatus status) {
        return ResponseEntity.ok(eventService.getEventsByTeamAndStatus(teamId, status));
    }

    /**
     * Retourne tous les événements publics à venir.
     * GET /api/events/get/public
     */
    @GetMapping("/get/public")
    public ResponseEntity<List<Event>> getPublicEvents() {
        return ResponseEntity.ok(eventService.getPublicUpcomingEvents());
    }

    // ═══════════════════════════════════════════════════════════════
    //  RSVP
    // ═══════════════════════════════════════════════════════════════

    /**
     * Un joueur répond YES ou NO à un événement.
     * POST /api/events/rsvp/add/{eventId}/{userId}?status=YES&attendanceScore=75
     * US-029 / US-030
     */
    @PostMapping("/rsvp/add/{eventId}/{userId}")
    public ResponseEntity<EventParticipation> respondToEvent(
            @PathVariable String eventId,
            @PathVariable String userId,
            @RequestParam RSVPStatus status,
            @RequestParam(defaultValue = "50") Integer attendanceScore) {

        Event event = findEventOrThrow(eventId);
        User user   = findUserOrThrow(userId);

        return ResponseEntity.ok(
                eventService.respondToEvent(event, user, status, attendanceScore));
    }

    /**
     * Retourne toutes les participations d'un événement.
     * GET /api/events/participations/get/{eventId}
     * US-031
     */
    @GetMapping("/participations/get/{eventId}")
    public ResponseEntity<List<EventParticipation>> getParticipations(
            @PathVariable String eventId) {

        Event event = findEventOrThrow(eventId);
        return ResponseEntity.ok(eventService.getParticipations(event));
    }

    // ═══════════════════════════════════════════════════════════════
    //  PAIEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Confirme le paiement d'un joueur après validation Flouci.
     * PUT /api/events/payment/confirm/{eventId}/{userId}
     */
    @PutMapping("/payment/confirm/{eventId}/{userId}")
    public ResponseEntity<EventParticipation> confirmPayment(
            @PathVariable String eventId,
            @PathVariable String userId) {

        Event event = findEventOrThrow(eventId);
        User user   = findUserOrThrow(userId);

        return ResponseEntity.ok(eventService.confirmPayment(event, user));
    }

    // ═══════════════════════════════════════════════════════════════
    //  VALIDATION DES PRÉSENCES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Le capitaine valide la présence réelle d'un joueur.
     * PUT /api/events/presence/update/{eventId}/{userId}?isPresent=true
     * US-031
     */
    @PutMapping("/presence/update/{eventId}/{userId}")
    public ResponseEntity<EventParticipation> validatePresence(
            @PathVariable String eventId,
            @PathVariable String userId,
            @RequestParam Boolean isPresent) {

        Event event = findEventOrThrow(eventId);
        User user   = findUserOrThrow(userId);

        return ResponseEntity.ok(eventService.validatePresence(event, user, isPresent));
    }

    // ═══════════════════════════════════════════════════════════════
    //  STATS ASSIDUITÉ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Retourne le taux de présence d'un joueur (en %).
     * GET /api/events/stats/attendance/{userId}
     * US-037
     */
    @GetMapping("/stats/attendance/{userId}")
    public ResponseEntity<Double> getAttendanceRate(@PathVariable String userId) {
        User user = findUserOrThrow(userId);
        return ResponseEntity.ok(eventService.getAttendanceRate(user));
    }
}