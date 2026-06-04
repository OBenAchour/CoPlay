package com.example.coplaybackend.Controllers.Events;

import com.example.coplaybackend.DTOs.Events.EventRequestDTO;
import com.example.coplaybackend.DTOs.Events.FlouciInitResponse;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Events.*;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Events.EventRepository;
import com.example.coplaybackend.Repositories.Events.LocationRepository;
import com.example.coplaybackend.Repositories.Teams.TeamRepository;
import com.example.coplaybackend.Services.Events.EventService;
import com.example.coplaybackend.Services.Events.FlouciPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;           // ✅ AJOUTÉ
    private final LocationRepository locationRepository;   // ✅ AJOUTÉ
    private final FlouciPaymentService flouciPaymentService; // ✅ paiement Flouci

    /** URL du frontend pour les redirections de retour Flouci. */
    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    // ── Méthodes utilitaires ───────────────────────────────────────

    private Event findEventOrThrow(String eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement introuvable : " + eventId));
    }

    private User findUserOrThrow(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + userId));
    }

    // ═══════════════════════════════════════════════════════════════
    //  ÉVÉNEMENTS
    // ═══════════════════════════════════════════════════════════════

    @GetMapping("/all")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAll());
    }

    /**
     * Crée un nouvel événement.
     * POST /api/events/add
     * ✅ MODIFIÉ pour utiliser EventRequestDTO
     */
    @PostMapping("/add")
    public ResponseEntity<Event> createEvent(@RequestBody EventRequestDTO dto) {

        // Construire l'objet Event à partir du DTO
        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        event.setIsPublic(dto.getIsPublic());
        event.setMaxParticipants(dto.getMaxParticipants());
        event.setIsPaid(dto.getIsPaid());
        event.setRegistrationFee(dto.getRegistrationFee());
        event.setPaymentDeadlineHours(dto.getPaymentDeadlineHours());

        // Charger Team si fourni
        if (dto.getTeamId() != null && !dto.getTeamId().isEmpty()) {
            teamRepository.findById(dto.getTeamId()).ifPresent(event::setTeamId);
        }

        // Charger Location si fourni
        if (dto.getLocationId() != null && !dto.getLocationId().isEmpty()) {
            locationRepository.findById(dto.getLocationId()).ifPresent(event::setLocationId);
        }

        Event created = eventService.createEvent(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }


    /**
     * Met à jour uniquement le statut d'un événement.
     * PUT /api/events/update/{eventId}/status?status=ONGOING
     */
    @PutMapping("/update/{eventId}/status")
    public ResponseEntity<Event> updateEventStatus(
            @PathVariable String eventId,
            @RequestParam EventStatus status) {

        Event event = findEventOrThrow(eventId);
        event.setStatus(status);
        Event updated = eventRepository.save(event);
        return ResponseEntity.ok(updated);
    }

    /**
     * Modifie un événement existant.
     * PUT /api/events/update/{eventId}
     * ✅ MODIFIÉ pour utiliser EventRequestDTO
     */
    @PutMapping("/update/{eventId}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable String eventId,
            @RequestBody EventRequestDTO dto) {

        // Construire l'objet Event à partir du DTO
        Event updatedData = new Event();
        updatedData.setTitle(dto.getTitle());
        updatedData.setStartDate(dto.getStartDate());
        updatedData.setEndDate(dto.getEndDate());
        updatedData.setIsPublic(dto.getIsPublic());
        updatedData.setMaxParticipants(dto.getMaxParticipants());
        updatedData.setIsPaid(dto.getIsPaid());
        updatedData.setRegistrationFee(dto.getRegistrationFee());
        updatedData.setPaymentDeadlineHours(dto.getPaymentDeadlineHours());

        // Charger Location si fourni
        if (dto.getLocationId() != null && !dto.getLocationId().isEmpty()) {
            locationRepository.findById(dto.getLocationId()).ifPresent(updatedData::setLocationId);
        }

        return ResponseEntity.ok(eventService.updateEvent(eventId, updatedData));
    }

    /**
     * Annule un événement.
     * DELETE /api/events/delete/{eventId}
     */
    @DeleteMapping("/delete/{eventId}")
    public ResponseEntity<Void> cancelEvent(@PathVariable String eventId) {
        eventService.cancelEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retourne un événement par son ID.
     * GET /api/events/get/{eventId}
     * ✅ AJOUTÉ
     */
    @GetMapping("/get/{eventId}")
    public ResponseEntity<Event> getEventById(@PathVariable String eventId) {
        Event event = findEventOrThrow(eventId);
        return ResponseEntity.ok(event);
    }

    /**
     * Retourne tous les événements d'une équipe.
     * GET /api/events/get/team/{teamId}
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

    @GetMapping("/participations/get/{eventId}")
    public ResponseEntity<List<EventParticipation>> getParticipations(
            @PathVariable String eventId) {

        Event event = findEventOrThrow(eventId);
        return ResponseEntity.ok(eventService.getParticipations(event));
    }

    /**
     * Annule la participation (RSVP) d'un joueur à un événement.
     * DELETE /api/events/rsvp/delete/{eventId}/{userId}
     * Libère la place et promeut le prochain en liste d'attente si besoin.
     */
    @DeleteMapping("/rsvp/delete/{eventId}/{userId}")
    public ResponseEntity<Void> cancelRsvp(
            @PathVariable String eventId,
            @PathVariable String userId) {

        Event event = findEventOrThrow(eventId);
        User user   = findUserOrThrow(userId);

        eventService.cancelRsvp(event, user);
        return ResponseEntity.noContent().build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  PAIEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Paiement « simulé » (démo) : passe directement le statut à PAID sans passerelle.
     * Conservé comme repli quand Flouci n'est pas configuré.
     */
    @PutMapping("/payment/confirm/{eventId}/{userId}")
    public ResponseEntity<EventParticipation> confirmPayment(
            @PathVariable String eventId,
            @PathVariable String userId) {

        Event event = findEventOrThrow(eventId);
        User user   = findUserOrThrow(userId);

        return ResponseEntity.ok(eventService.confirmPayment(event, user));
    }

    /**
     * Initie un paiement Flouci pour la participation du joueur.
     * POST /api/events/payment/initiate/{eventId}/{userId}
     * Renvoie l'URL de paiement Flouci (link) + le payment_id (stocké côté participation).
     */
    @PostMapping("/payment/initiate/{eventId}/{userId}")
    public ResponseEntity<FlouciInitResponse> initiateFlouciPayment(
            @PathVariable String eventId,
            @PathVariable String userId) {

        Event event = findEventOrThrow(eventId);
        User user   = findUserOrThrow(userId);

        EventParticipation participation = eventService.getParticipation(event, user);
        double amount = event.getRegistrationFee() != null ? event.getRegistrationFee() : 0.0;

        String successLink = frontendUrl + "/events/" + eventId + "?flouciPaid=1";
        String failLink    = frontendUrl + "/events/" + eventId + "?flouciPaid=0";

        FlouciInitResponse init = flouciPaymentService.generatePayment(
                amount, successLink, failLink, participation.getParticipationId());

        // Mémoriser le payment_id pour la vérification au retour
        eventService.attachFlouciPaymentId(event, user, init.getPaymentId());

        return ResponseEntity.ok(init);
    }

    /**
     * Vérifie le paiement Flouci au retour de la page de paiement et finalise (PAID).
     * PUT /api/events/payment/verify/{eventId}/{userId}
     */
    @PutMapping("/payment/verify/{eventId}/{userId}")
    public ResponseEntity<EventParticipation> verifyFlouciPayment(
            @PathVariable String eventId,
            @PathVariable String userId) {

        Event event = findEventOrThrow(eventId);
        User user   = findUserOrThrow(userId);

        EventParticipation participation = eventService.getParticipation(event, user);
        boolean paid = flouciPaymentService.verifyPayment(participation.getFlouciPaymentId());

        if (!paid) {
            // Paiement non confirmé → on renvoie l'état actuel (toujours PENDING)
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(participation);
        }

        // Paiement confirmé → on finalise via la logique métier existante
        return ResponseEntity.ok(eventService.confirmPayment(event, user));
    }

    // ═══════════════════════════════════════════════════════════════
    //  VALIDATION DES PRÉSENCES
    // ═══════════════════════════════════════════════════════════════

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

    @GetMapping("/stats/attendance/{userId}")
    public ResponseEntity<Double> getAttendanceRate(@PathVariable String userId) {
        User user = findUserOrThrow(userId);
        return ResponseEntity.ok(eventService.getAttendanceRate(user));
    }
}