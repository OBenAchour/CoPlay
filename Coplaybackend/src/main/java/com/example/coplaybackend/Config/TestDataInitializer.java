package com.example.coplaybackend.Config;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Coaching.*;
import com.example.coplaybackend.Entities.Marketplace.Equipment;
import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Coaching.*;
import com.example.coplaybackend.Repositories.Marketplace.EquipmentRepository;
import com.example.coplaybackend.Repositories.Marketplace.MarketplaceServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Initializes demo data once at application startup for a specific test account.
 * Idempotent: skips when data already present.
 */
@Component
@Order(100)
@RequiredArgsConstructor
@Slf4j
public class TestDataInitializer implements CommandLineRunner {

    /** Email du compte cible pour les données de démo. */
    private static final String TARGET_EMAIL = "ahmed@coplay.com";

    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final MarketplaceServiceRepository serviceRepository;
    private final InjuryRepository injuryRepository;
    private final PerformanceMetricRepository performanceRepository;
    private final ProgressEntryRepository progressRepository;
    private final LibraryExerciseRepository exerciseRepository;
    private final HydrationLogRepository hydrationRepository;
    private final NutritionPlanRepository nutritionRepository;
    private final MedicalRecordRepository medicalRepository;
    private final CoachProfileRepository coachProfileRepository;

    @Override
    public void run(String... args) {
        try {
            Optional<User> user = userRepository.findByEmail(TARGET_EMAIL);
            if (user.isEmpty()) {
                log.debug("[seed] target user {} not found, skipping", TARGET_EMAIL);
                return;
            }

            String uid = user.get().getId();  // ✅ CORRECT
            int equipments = seedEquipments(uid);
            int services = seedServices(uid);
            int injuries = seedInjuries(uid);
            int perf = seedPerformance(uid);
            int prog = seedProgress(uid);
            int ex = seedExercises(uid);
            int hydro = seedHydration(uid);
            int nut = seedNutrition(uid);
            int med = seedMedical(uid);
            int coach = seedCoachProfile(uid);

            int total = equipments + services + injuries + perf + prog + ex + hydro + nut + med + coach;
            if (total > 0) {
                log.info("[seed] initialized {} demo records for {} (eq={}, sv={}, inj={}, perf={}, prog={}, ex={}, hyd={}, nut={}, med={}, coach={})",
                        total, TARGET_EMAIL, equipments, services, injuries, perf, prog, ex, hydro, nut, med, coach);
            } else {
                log.debug("[seed] data already present for {}, skipping", TARGET_EMAIL);
            }
        } catch (Exception e) {
            log.warn("[seed] init failed: {}", e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────
    // MARKETPLACE
    // ─────────────────────────────────────────────────────────

    private int seedEquipments(String userId) {
        if (!equipmentRepository.findBySellerIdAndDeletedFalse(userId).isEmpty()) return 0;

        List<Equipment> list = List.of(
            buildEq(userId, "Raquette Wilson Pro Staff RF97 v14",
                "Raquette de tournoi utilisée 6 mois, état impeccable. Cordage Babolat VS Touch 1.30. Grip 3 (4 3/8). Excellent pour joueurs avancés cherchant contrôle et puissance.",
                180, "Wilson", "TENNIS", "Raquette", "USED", "SALE", "Paris", 48.8566, 2.3522, 1, null,
                "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800"),

            buildEq(userId, "Vélo de route Trek Domane SL5 carbone",
                "Vélo carbone taille 56, Shimano 105, 2200km au compteur. Idéal cyclo-sportive et longues distances.",
                1850, "Trek", "CYCLING", "Vélo", "USED", "BOTH", "Lyon", 45.7640, 4.8357, 1, 35,
                "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800"),

            buildEq(userId, "Ballon Adidas UEFA Euro 2024 Match Ball",
                "Ballon officiel UEFA Euro 2024, taille 5, neuf sous emballage. Technologie Adidas Connected Ball avec capteur intégré.",
                145, "Adidas", "FOOTBALL", "Ballon", "NEW", "SALE", "Marseille", 43.2965, 5.3698, 3, null,
                "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800"),

            buildEq(userId, "Haltères réglables PowerBlock 50lb (paire)",
                "Paire d'haltères PowerBlock USA, 2.5 à 22.5 kg par main, gain de place énorme. Reconditionnés certifiés (état 9/10).",
                380, "PowerBlock", "FITNESS", "Musculation", "REFURBISHED", "SALE", "Bordeaux", 44.8378, -0.5792, 2, null,
                "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800"),

            buildEq(userId, "Nike Vaporfly Next% 3 - Taille 42",
                "Chaussures de compétition utilisées 3 fois (60km), encore neuves. Taille 42 EU. Couleur Volt/Black.",
                220, "Nike", "RUNNING", "Chaussures", "USED", "SALE", "Toulouse", 43.6047, 1.4442, 1, null,
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"),

            buildEq(userId, "Tapis yoga Manduka Pro Premium",
                "Tapis yoga Manduka Pro 6mm, antidérapant haute densité. Acheté il y a 2 mois, comme neuf. 180x66cm.",
                95, "Manduka", "FITNESS", "Yoga", "USED", "SALE", "Paris", 48.8566, 2.3522, 1, null,
                "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800")
        );

        list.forEach(equipmentRepository::save);
        return list.size();
    }

    private Equipment buildEq(String userId, String name, String desc, double price, String brand,
                              String sport, String cat, String cond, String type, String city,
                              double lat, double lng, int qty, Integer rentalPrice, String imageUrl) {
        return Equipment.builder()
                .sellerId(userId)
                .name(name)
                .description(desc)
                .price(BigDecimal.valueOf(price))
                .rentalPricePerDay(rentalPrice != null ? BigDecimal.valueOf(rentalPrice) : null)
                .brand(brand)
                .sport(sport)
                .category(cat)
                .condition(cond)
                .listingType(type)
                .city(city)
                .latitude(lat)
                .longitude(lng)
                .quantity(qty)
                .status("AVAILABLE")
                .images(new ArrayList<>(List.of(imageUrl)))
                .videos(new ArrayList<>())
                .tags(new ArrayList<>(List.of(sport.toLowerCase(), cat.toLowerCase())))
                .views(0L)
                .rating(0.0)
                .reviewCount(0)
                .deleted(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private int seedServices(String userId) {
        if (!serviceRepository.findByProviderIdAndDeletedFalse(userId).isEmpty()) return 0;

        List<MarketplaceService> services = List.of(
            buildSv(userId, "Kiné du sport - Récupération performance",
                "Kinésithérapeute spécialisé sportifs. Massage récupération, rééducation post-blessure, préparation compétition. 15 ans d'expérience avec clubs pros.",
                65, "HOURLY", "PHYSIO", "FOOTBALL",
                List.of("DE Kinésithérapie", "DU Médecine du sport", "Préparateur physique FFR"),
                "Paris", 48.8566, 2.3522, 15.0),

            buildSv(userId, "Photographe sport - Reportage match",
                "Photo-reportage de match (foot, basket, rugby). Livraison 200 photos retouchées sous 48h. Matériel pro Canon R5 + 70-200 f/2.8.",
                350, "PER_EVENT", "PHOTOGRAPHER", "FOOTBALL",
                List.of("BTS Photographie"),
                "Lyon", 45.7640, 4.8357, 50.0),

            buildSv(userId, "Arbitre fédéral - Tournois amateurs",
                "Arbitre licencié FFF niveau régional. Disponible weekends pour tournois amateurs et matchs amicaux. Équipement complet fourni.",
                80, "PER_EVENT", "REFEREE", "FOOTBALL",
                List.of("Licence arbitre FFF Régional"),
                "Paris", 48.8566, 2.3522, 30.0),

            buildSv(userId, "Coach personnel - Préparation marathon",
                "Préparateur physique spécialisé endurance. Programmes marathon/trail. Suivi hebdomadaire, plan nutrition, analyse foulée vidéo.",
                50, "HOURLY", "COACH", "RUNNING",
                List.of("BPJEPS Activités gymniques", "Coach FFA"),
                "Marseille", 43.2965, 5.3698, 20.0)
        );

        services.forEach(serviceRepository::save);
        return services.size();
    }

    private MarketplaceService buildSv(String userId, String name, String desc, double price,
                                       String pricingModel, String category, String sport,
                                       List<String> certs, String city, double lat, double lng, double radius) {
        MarketplaceService.TimeSlot slot = MarketplaceService.TimeSlot.builder()
                .dayOfWeek("MON").startTime("09:00").endTime("18:00").build();
        return MarketplaceService.builder()
                .providerId(userId)
                .name(name)
                .description(desc)
                .price(BigDecimal.valueOf(price))
                .pricingModel(pricingModel)
                .category(category)
                .sport(sport)
                .certifications(new ArrayList<>(certs))
                .availability(new ArrayList<>(List.of(slot)))
                .city(city)
                .latitude(lat)
                .longitude(lng)
                .radiusKm(radius)
                .status("ACTIVE")
                .rating(0.0)
                .reviewCount(0)
                .deleted(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .images(new ArrayList<>())
                .build();
    }

    // ─────────────────────────────────────────────────────────
    // COACHING
    // ─────────────────────────────────────────────────────────

    private int seedInjuries(String userId) {
        if (!injuryRepository.findByUserId(userId).isEmpty()) return 0;
        List<Injury> list = List.of(
            Injury.builder().userId(userId)
                .bodyPart("Genou droit").type("Entorse LCA").severity("SEVERE")
                .dateOccurred(LocalDate.now().minusWeeks(3)).status("ACTIVE")
                .notes("Survenue lors d'un match de foot amateur. IRM prévue.")
                .recoveryPlan("Repos complet, kiné 3x/semaine, rééducation progressive")
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),

            Injury.builder().userId(userId)
                .bodyPart("Cheville gauche").type("Foulure").severity("MODERATE")
                .dateOccurred(LocalDate.now().minusWeeks(2)).status("HEALING")
                .notes("Foulure modérée, reprise progressive autorisée")
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),

            Injury.builder().userId(userId)
                .bodyPart("Épaule droite").type("Tendinite").severity("MINOR")
                .dateOccurred(LocalDate.now().minusWeeks(1)).status("ACTIVE")
                .notes("Tendinite naissante, exercices de mobilité quotidiens")
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),

            Injury.builder().userId(userId)
                .bodyPart("Mollet gauche").type("Élongation").severity("MODERATE")
                .dateOccurred(LocalDate.now().minusMonths(4)).status("RECOVERED")
                .notes("Récupération complète, reprise normale")
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build()
        );
        list.forEach(injuryRepository::save);
        return list.size();
    }

    private int seedPerformance(String userId) {
        if (!performanceRepository.findByUserId(userId).isEmpty()) return 0;
        LocalDate today = LocalDate.now();
        List<PerformanceMetric> list = List.of(
            // Charge basse-moyenne (J-25 à J-15)
            perf(userId, today.minusDays(25), "Course", 45, 6, 7.5, 450),
            perf(userId, today.minusDays(23), "Musculation", 60, 7, 0, 380),
            perf(userId, today.minusDays(20), "Course", 30, 5, 5.0, 300),
            perf(userId, today.minusDays(17), "Course intervalle", 50, 7, 9.0, 580),
            perf(userId, today.minusDays(15), "Musculation", 75, 7, 0, 450),
            // Spike récent → ACWR élevé
            perf(userId, today.minusDays(7), "Course longue", 90, 9, 16.0, 950),
            perf(userId, today.minusDays(5), "Course tempo", 60, 8, 11.0, 700),
            perf(userId, today.minusDays(3), "Musculation HIIT", 75, 9, 0, 620),
            perf(userId, today.minusDays(2), "Course sprint", 45, 9, 8.0, 510),
            perf(userId, today.minusDays(1), "VTT", 120, 8, 35.0, 1100),
            perf(userId, today, "Course tempo", 60, 8, 11.0, 700)
        );
        list.forEach(performanceRepository::save);
        return list.size();
    }

    private PerformanceMetric perf(String userId, LocalDate date, String activity, int min, int rpe, double km, int cal) {
        return PerformanceMetric.builder()
                .userId(userId).date(date).activity(activity)
                .minutes(min).rpe(rpe).sessionLoad((double) (min * rpe))
                .distanceKm(km).caloriesBurned(cal).build();
    }

    private int seedProgress(String userId) {
        if (!progressRepository.findByUserIdOrderByDateAsc(userId).isEmpty()) return 0;
        LocalDate today = LocalDate.now();
        List<ProgressEntry> list = List.of(
            ProgressEntry.builder().userId(userId).date(today.minusWeeks(4)).weightKg(78.5).bodyFatPct(18.0).build(),
            ProgressEntry.builder().userId(userId).date(today.minusWeeks(3)).weightKg(78.0).bodyFatPct(17.5).build(),
            ProgressEntry.builder().userId(userId).date(today.minusWeeks(2)).weightKg(77.6).bodyFatPct(17.0).build(),
            ProgressEntry.builder().userId(userId).date(today.minusWeeks(1)).weightKg(77.2).bodyFatPct(16.5).build(),
            ProgressEntry.builder().userId(userId).date(today).weightKg(76.8).bodyFatPct(16.0).build()
        );
        list.forEach(progressRepository::save);
        return list.size();
    }

    private int seedExercises(String userId) {
        if (exerciseRepository.count() > 5) return 0;
        List<LibraryExercise> list = List.of(
            LibraryExercise.builder().name("Squat").description("Mouvement fondamental jambes & fessiers")
                .difficulty("BEGINNER").equipmentNeeded("Aucun ou barre")
                .muscleGroups(new ArrayList<>(List.of("Quadriceps", "Fessiers", "Ischios")))
                .instructions("Pieds largeur épaules, descendre en gardant le dos droit jusqu'à 90°, remonter en poussant sur les talons.")
                .caloriesPerMin(7.0).createdBy(userId).approved(true).build(),

            LibraryExercise.builder().name("Pompes").description("Exercice complet haut du corps")
                .difficulty("BEGINNER").equipmentNeeded("Aucun")
                .muscleGroups(new ArrayList<>(List.of("Pectoraux", "Triceps", "Épaules")))
                .instructions("Corps gainé en planche, descendre poitrine près du sol, remonter en poussant.")
                .caloriesPerMin(8.0).createdBy(userId).approved(true).build(),

            LibraryExercise.builder().name("Soulevé de terre").description("Exercice roi du dos et chaîne postérieure")
                .difficulty("ADVANCED").equipmentNeeded("Barre + disques")
                .muscleGroups(new ArrayList<>(List.of("Dos", "Ischios", "Fessiers", "Trapèzes")))
                .instructions("Pieds sous la barre, dos plat, hanches et genoux poussent en synchro pour soulever.")
                .caloriesPerMin(10.0).createdBy(userId).approved(true).build(),

            LibraryExercise.builder().name("Burpees").description("Cardio HIIT pleine puissance")
                .difficulty("INTERMEDIATE").equipmentNeeded("Aucun")
                .muscleGroups(new ArrayList<>(List.of("Full body", "Cardio")))
                .instructions("Squat, planche, pompe, retour squat, saut vertical. Enchaîner sans pause.")
                .caloriesPerMin(14.0).createdBy(userId).approved(true).build(),

            LibraryExercise.builder().name("Planche").description("Gainage abdominal isométrique")
                .difficulty("BEGINNER").equipmentNeeded("Aucun")
                .muscleGroups(new ArrayList<>(List.of("Abdos", "Lombaires", "Épaules")))
                .instructions("Coudes sous épaules, corps aligné, contracter abdos et fessiers, ne pas creuser le dos.")
                .caloriesPerMin(5.0).createdBy(userId).approved(true).build(),

            LibraryExercise.builder().name("Tractions").description("Exercice complet dos et biceps")
                .difficulty("INTERMEDIATE").equipmentNeeded("Barre de traction")
                .muscleGroups(new ArrayList<>(List.of("Grand dorsal", "Biceps", "Avant-bras")))
                .instructions("Suspendu bras tendus, tirer le menton au-dessus de la barre, descendre lentement.")
                .caloriesPerMin(9.0).createdBy(userId).approved(true).build()
        );
        list.forEach(exerciseRepository::save);
        return list.size();
    }

    private int seedHydration(String userId) {
        if (!hydrationRepository.findByUserIdAndDateBetween(userId, LocalDate.now().minusDays(6), LocalDate.now()).isEmpty()) return 0;
        for (int i = 6; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusDays(i);
            int ml = (int) (1500 + Math.random() * 1500);
            hydrationRepository.save(HydrationLog.builder().userId(userId).date(d).ml(ml).goalMl(2500).build());
        }
        return 7;
    }

    private int seedNutrition(String userId) {
        if (!nutritionRepository.findByUserId(userId).isEmpty()) return 0;
        NutritionPlan plan = NutritionPlan.builder()
                .userId(userId)
                .objective("PERFORMANCE")
                .dailyCalories(2800)
                .proteinsG(180).carbsG(320).fatsG(85)
                .hydrationGoalMl(3000)
                .meals(new ArrayList<>(List.of(
                    NutritionPlan.Meal.builder().name("breakfast")
                        .description("Avoine + banane + amandes + œufs").calories(650)
                        .ingredients(List.of("60g flocons avoine", "1 banane", "30g amandes", "3 œufs")).build(),
                    NutritionPlan.Meal.builder().name("lunch")
                        .description("Poulet + riz complet + légumes verts + huile olive").calories(800)
                        .ingredients(List.of("180g blanc de poulet", "120g riz cru", "200g brocoli", "1 c.à.s huile olive")).build(),
                    NutritionPlan.Meal.builder().name("snack")
                        .description("Yaourt grec + miel + fruits rouges").calories(350)
                        .ingredients(List.of("200g yaourt grec 0%", "1 c.à.s miel", "150g fruits rouges")).build(),
                    NutritionPlan.Meal.builder().name("dinner")
                        .description("Saumon + patate douce + salade").calories(700)
                        .ingredients(List.of("200g saumon", "250g patate douce", "mesclun + vinaigrette")).build()
                )))
                .aiGenerated(false)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();
        nutritionRepository.save(plan);
        return 1;
    }

    private int seedMedical(String userId) {
        if (medicalRepository.findByUserId(userId).isPresent()) return 0;
        MedicalRecord r = MedicalRecord.builder()
                .userId(userId)
                .bloodType("O+")
                .allergies(new ArrayList<>(List.of("Pollen", "Arachides")))
                .chronicConditions(new ArrayList<>(List.of("Asthme léger")))
                .medications(new ArrayList<>(List.of("Ventoline (au besoin)")))
                .emergencyContactName("Marie Dupont")
                .emergencyContactPhone("0612345678")
                .lastCheckup(LocalDate.now().minusMonths(2))
                .consent(true)
                .authorizedCoachIds(new ArrayList<>())
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();
        medicalRepository.save(r);
        return 1;
    }

    private int seedCoachProfile(String userId) {
        if (coachProfileRepository.findByUserId(userId).isPresent()) return 0;
        CoachProfile.Certification cert = CoachProfile.Certification.builder()
                .name("BPJEPS Activités gymniques de la forme et de la force")
                .issuer("Ministère des Sports").year(2019).verified(true).build();
        CoachProfile p = CoachProfile.builder()
                .userId(userId)
                .bio("Coach certifié 8 ans d'expérience. Spécialisé musculation, prépa physique foot et running. Approche scientifique et bienveillante.")
                .specialties(new ArrayList<>(List.of("Musculation", "Préparation physique", "Running", "Perte de gras")))
                .certifications(new ArrayList<>(List.of(cert)))
                .yearsExperience(8)
                .hourlyRate(BigDecimal.valueOf(55))
                .rating(4.8).reviewCount(23).verified(true)
                .availability(new ArrayList<>(List.of(
                    CoachProfile.Availability.builder().dayOfWeek("MON").startTime("09:00").endTime("19:00").build(),
                    CoachProfile.Availability.builder().dayOfWeek("WED").startTime("09:00").endTime("19:00").build(),
                    CoachProfile.Availability.builder().dayOfWeek("FRI").startTime("09:00").endTime("19:00").build()
                )))
                .city("Paris").latitude(48.8566).longitude(2.3522)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();
        coachProfileRepository.save(p);
        return 1;
    }
}
