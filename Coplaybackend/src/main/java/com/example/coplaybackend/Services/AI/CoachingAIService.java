package com.example.coplaybackend.Services.AI;

import com.example.coplaybackend.DTOs.Coaching.AIProgramRequest;
import com.example.coplaybackend.DTOs.Coaching.NutritionAIRequest;
import com.example.coplaybackend.Entities.Coaching.CoachingProgram;
import com.example.coplaybackend.Entities.Coaching.Injury;
import com.example.coplaybackend.Entities.Coaching.NutritionPlan;
import com.example.coplaybackend.Repositories.Coaching.CoachingProgramRepository;
import com.example.coplaybackend.Repositories.Coaching.NutritionPlanRepository;
import com.example.coplaybackend.Services.Coaching.InjuryService;
import com.example.coplaybackend.Services.Coaching.PerformanceAnalysisService;
import com.example.coplaybackend.Utils.SecurityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoachingAIService {

    private final AIClient aiClient;
    private final InjuryService injuryService;
    private final PerformanceAnalysisService performanceAnalysisService;
    private final CoachingProgramRepository programRepository;
    private final NutritionPlanRepository nutritionRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public CoachingProgram generateProgram(AIProgramRequest req) {
        String coachId = SecurityUtils.getCurrentUserId();
        String clientId = req.getClientId() != null ? req.getClientId() : coachId;
        List<Injury> activeInjuries = injuryService.listActiveFor(clientId);
        String injuriesText = activeInjuries.isEmpty() ? "aucune" :
                activeInjuries.stream().map(i -> i.getBodyPart() + " (" + i.getSeverity() + ")")
                        .collect(Collectors.joining(", "));

        int weeks = req.getDurationWeeks() != null ? req.getDurationWeeks() : 4;
        // On demande à l'IA UNE semaine type détaillée puis on la duplique côté serveur
        // pour économiser les tokens et éviter les troncatures.
        String prompt = """
            Tu es coach sportif. Génère UNE semaine type d'entraînement en JSON pur (pas de markdown, pas de texte autour).
            Contexte: sport=%s, objectif=%s, niveau=%s, blessures actives=%s.
            Si blessures, évite STRICTEMENT les exercices qui sollicitent ces zones.
            Schéma JSON exact à respecter:
            {"title":"<titre court>","description":"<2 phrases>","focus":"<focus de la semaine>","days":[{"dayOfWeek":"MON","title":"<nom séance>","exercises":[{"name":"<exercice>","sets":3,"reps":12,"durationSec":0,"restSec":60,"notes":""}]}]}
            Inclure 4 à 6 jours d'entraînement (ex: MON,TUE,WED,FRI,SAT) avec 5 à 7 exercices chacun. JSON uniquement.
            """.formatted(safe(req.getSport()), safe(req.getObjective()), safe(req.getLevel()), injuriesText);

        log.debug("[AI Program] prompt length={}", prompt.length());
        String resp = aiClient.complete(prompt);
        log.debug("[AI Program] response: {}", resp);

        Map<String, Object> parsed = parseJson(resp);
        String title = str(parsed.get("title"), defaultTitle(req));
        String description = str(parsed.get("description"), "Programme " + safe(req.getObjective()) + " niveau " + safe(req.getLevel()));
        String focus = str(parsed.get("focus"), "Progression " + safe(req.getObjective()));
        List<CoachingProgram.DaySession> days = parseDays(parsed.get("days"));

        // Fallback si l'IA n'a rien renvoyé d'utilisable
        if (days.isEmpty()) {
            log.warn("[AI Program] AI returned no days, using fallback");
            days = fallbackDays(req);
        }

        // Réplique la semaine type sur N semaines (avec progression légère du focus)
        List<CoachingProgram.WeekPlan> weekly = new ArrayList<>();
        for (int w = 1; w <= weeks; w++) {
            List<CoachingProgram.DaySession> weekDays = new ArrayList<>();
            for (CoachingProgram.DaySession d : days) {
                weekDays.add(CoachingProgram.DaySession.builder()
                        .dayOfWeek(d.getDayOfWeek())
                        .title(d.getTitle())
                        .exercises(new ArrayList<>(d.getExercises()))
                        .completed(false)
                        .build());
            }
            weekly.add(CoachingProgram.WeekPlan.builder()
                    .weekNumber(w)
                    .focus(weekFocus(focus, w, weeks))
                    .days(weekDays)
                    .build());
        }

        CoachingProgram program = CoachingProgram.builder()
                .coachId(coachId)
                .clientId(clientId)
                .clientType(req.getClientType() != null ? req.getClientType() : "USER")
                .objective(req.getObjective())
                .level(req.getLevel())
                .durationWeeks(weeks)
                .aiGenerated(true)
                .status("DRAFT")
                .title(title)
                .description(description)
                .weeklyPlan(weekly)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return programRepository.save(program);
    }

    private String defaultTitle(AIProgramRequest r) {
        return "Programme " + safe(r.getObjective()) + " - " + safe(r.getSport());
    }

    private String weekFocus(String base, int week, int total) {
        if (week == 1) return "Adaptation - " + base;
        if (week == total) return "Pic de forme - " + base;
        if (week > total / 2) return "Intensification - " + base;
        return "Volume - " + base;
    }

    /** Programme par défaut si l'IA ne renvoie rien d'exploitable. */
    private List<CoachingProgram.DaySession> fallbackDays(AIProgramRequest req) {
        List<CoachingProgram.DaySession> days = new ArrayList<>();
        days.add(daySession("MON", "Force jambes", List.of(
                ex("Squat", 4, 10, 90), ex("Fentes", 3, 12, 60),
                ex("Soulevé de terre roumain", 3, 10, 90), ex("Mollets debout", 3, 15, 45)
        )));
        days.add(daySession("TUE", "Cardio intensif", List.of(
                ex("Échauffement course", 1, 1, 0, 600),
                ex("Intervalles 400m", 6, 1, 90, 0),
                ex("Retour au calme", 1, 1, 0, 300)
        )));
        days.add(daySession("WED", "Repos actif", List.of(
                ex("Mobilité hanches", 1, 10, 30), ex("Étirements full body", 1, 15, 30)
        )));
        days.add(daySession("THU", "Push - haut du corps", List.of(
                ex("Développé couché", 4, 8, 90), ex("Pompes", 3, 12, 60),
                ex("Développé épaules", 3, 10, 75), ex("Dips", 3, 10, 60)
        )));
        days.add(daySession("FRI", "Pull - haut du corps", List.of(
                ex("Tractions", 4, 8, 90), ex("Rowing barre", 4, 10, 75),
                ex("Curl biceps", 3, 12, 60), ex("Face pull", 3, 15, 45)
        )));
        days.add(daySession("SAT", "Cardio long", List.of(
                ex("Course continue", 1, 1, 0, 1800)
        )));
        return days;
    }

    private CoachingProgram.DaySession daySession(String day, String title, List<CoachingProgram.ProgramExercise> exs) {
        return CoachingProgram.DaySession.builder()
                .dayOfWeek(day).title(title)
                .exercises(new ArrayList<>(exs))
                .completed(false).build();
    }
    private CoachingProgram.ProgramExercise ex(String name, int sets, int reps, int rest) {
        return ex(name, sets, reps, rest, 0);
    }
    private CoachingProgram.ProgramExercise ex(String name, int sets, int reps, int rest, int duration) {
        return CoachingProgram.ProgramExercise.builder()
                .name(name).sets(sets).reps(reps).restSec(rest).durationSec(duration).notes("").build();
    }

    public NutritionPlan generateNutrition(NutritionAIRequest req) {
        double tdee = computeTdee(req);
        String prompt = """
            Crée un plan nutrition quotidien en JSON.
            Objectif: %s. Calories cible: %.0f kcal.
            Allergies: %s. Sexe: %s. Niveau d'activité: %s.
            Réponds STRICTEMENT en JSON:
            {"dailyCalories":%d,"proteinsG":..,"carbsG":..,"fatsG":..,"hydrationGoalMl":..,
             "meals":[{"name":"breakfast","description":"...","calories":...,"ingredients":["..."]}]}
            """.formatted(safe(req.getObjective()), tdee,
                req.getAllergies() == null ? "aucune" : String.join(", ", req.getAllergies()),
                safe(req.getSex()), safe(req.getActivityLevel()), (int) tdee);

        String resp = aiClient.complete(prompt);
        Map<String, Object> parsed = parseJson(resp);
        NutritionPlan plan = NutritionPlan.builder()
                .userId(SecurityUtils.getCurrentUserId())
                .objective(req.getObjective())
                .dailyCalories(toInt(parsed.get("dailyCalories"), (int) tdee))
                .proteinsG(toInt(parsed.get("proteinsG"), 0))
                .carbsG(toInt(parsed.get("carbsG"), 0))
                .fatsG(toInt(parsed.get("fatsG"), 0))
                .hydrationGoalMl(toInt(parsed.get("hydrationGoalMl"), 2500))
                .meals(parseMeals(parsed.get("meals")))
                .aiGenerated(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return nutritionRepository.save(plan);
    }

    public Map<String, Object> predictInjuryRisk(String userId) {
        Map<String, Object> acwr = performanceAnalysisService.computeAcwr(userId);
        List<Injury> active = injuryService.listActiveFor(userId);
        String prompt = """
            Analyse le risque de blessure. ACWR=%.2f label=%s. Blessures actives: %s.
            Réponds STRICTEMENT en JSON: {"riskScore":0..1,"zones":["..."],"advice":"..."}.
            """.formatted(((Number) acwr.getOrDefault("acwr", 0.0)).doubleValue(),
                acwr.get("label"),
                active.isEmpty() ? "aucune" : active.stream().map(Injury::getBodyPart).collect(Collectors.joining(",")));
        Map<String, Object> result = parseJson(aiClient.complete(prompt));
        Map<String, Object> merged = new HashMap<>(acwr);
        merged.putAll(result);
        return merged;
    }

    public String chatbot(String userId, String message) {
        String prompt = """
            Tu es un coach sportif virtuel. Réponds en français de manière concise (3-4 phrases) à la question:
            "%s"
            Si la question concerne la nutrition, l'entraînement ou la récupération, donne un conseil concret.
            """.formatted(message);
        return aiClient.complete(prompt);
    }

    public Map<String, Object> recoveryAnalysis(String userId) {
        return performanceAnalysisService.computeAcwr(userId);
    }

    private double computeTdee(NutritionAIRequest r) {
        double w = r.getWeightKg() == null ? 70 : r.getWeightKg();
        double h = r.getHeightCm() == null ? 175 : r.getHeightCm();
        int a = r.getAge() == null ? 30 : r.getAge();
        boolean male = r.getSex() == null || r.getSex().toUpperCase().startsWith("M");
        double bmr = male ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
        double mult = switch (r.getActivityLevel() == null ? "MEDIUM" : r.getActivityLevel().toUpperCase()) {
            case "LOW" -> 1.3;
            case "HIGH" -> 1.7;
            default -> 1.5;
        };
        double base = bmr * mult;
        if ("FAT_LOSS".equalsIgnoreCase(r.getObjective())) base -= 400;
        if ("MUSCLE_GAIN".equalsIgnoreCase(r.getObjective())) base += 300;
        return base;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String s) {
        if (s == null || s.isBlank()) {
            log.warn("[AI] response is null/empty");
            return Map.of();
        }
        // Nettoie les fences markdown ```json ... ```
        String cleaned = s.replaceAll("(?s)```(?:json)?\\s*", "").replaceAll("```", "").trim();
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start < 0) {
            log.warn("[AI] no JSON object found in response: {}", abbreviate(s));
            return Map.of();
        }
        // Si réponse tronquée (pas de '}' final), tente d'auto-fermer en remontant
        String candidate = end > start ? cleaned.substring(start, end + 1) : autoClose(cleaned.substring(start));
        try {
            return mapper.readValue(candidate, Map.class);
        } catch (Exception e) {
            log.warn("[AI] parseJson failed: {} | response start: {}", e.getMessage(), abbreviate(s));
            return Map.of();
        }
    }

    /** Tente de fermer brutalement le JSON tronqué en équilibrant accolades/crochets. */
    private String autoClose(String partial) {
        int braces = 0, brackets = 0;
        boolean inStr = false; boolean escape = false;
        StringBuilder sb = new StringBuilder(partial);
        // tronque aux derniers caractères "safe" (avant une string non fermée)
        int lastSafe = -1;
        for (int i = 0; i < sb.length(); i++) {
            char c = sb.charAt(i);
            if (escape) { escape = false; continue; }
            if (c == '\\') { escape = true; continue; }
            if (c == '"') inStr = !inStr;
            if (inStr) continue;
            if (c == '{') braces++;
            else if (c == '}') braces--;
            else if (c == '[') brackets++;
            else if (c == ']') brackets--;
            if (!inStr && (c == ',' || c == '}' || c == ']')) lastSafe = i;
        }
        if (inStr || lastSafe == -1) return sb.toString();
        sb.setLength(lastSafe + 1);
        // retire trailing comma
        if (sb.charAt(sb.length() - 1) == ',') sb.setLength(sb.length() - 1);
        for (int i = 0; i < brackets; i++) sb.append(']');
        for (int i = 0; i < braces; i++) sb.append('}');
        return sb.toString();
    }

    private String abbreviate(String s) {
        if (s == null) return "";
        return s.length() > 300 ? s.substring(0, 300) + "..." : s;
    }

    @SuppressWarnings("unchecked")
    private List<CoachingProgram.WeekPlan> parseWeeks(Object raw) {
        List<CoachingProgram.WeekPlan> result = new ArrayList<>();
        if (!(raw instanceof List<?> list)) return result;
        for (Object o : list) {
            if (!(o instanceof Map<?, ?> m)) continue;
            CoachingProgram.WeekPlan w = CoachingProgram.WeekPlan.builder()
                    .weekNumber(toInt(m.get("weekNumber"), result.size() + 1))
                    .focus(str(m.get("focus"), ""))
                    .days(parseDays(m.get("days")))
                    .build();
            result.add(w);
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private List<CoachingProgram.DaySession> parseDays(Object raw) {
        List<CoachingProgram.DaySession> days = new ArrayList<>();
        if (!(raw instanceof List<?> list)) return days;
        for (Object o : list) {
            if (!(o instanceof Map<?, ?> m)) continue;
            days.add(CoachingProgram.DaySession.builder()
                    .dayOfWeek(str(m.get("dayOfWeek"), ""))
                    .title(str(m.get("title"), ""))
                    .exercises(parseExercises(m.get("exercises")))
                    .completed(false)
                    .build());
        }
        return days;
    }

    @SuppressWarnings("unchecked")
    private List<CoachingProgram.ProgramExercise> parseExercises(Object raw) {
        List<CoachingProgram.ProgramExercise> ex = new ArrayList<>();
        if (!(raw instanceof List<?> list)) return ex;
        for (Object o : list) {
            if (!(o instanceof Map<?, ?> m)) continue;
            ex.add(CoachingProgram.ProgramExercise.builder()
                    .name(str(m.get("name"), ""))
                    .sets(toInt(m.get("sets"), 0))
                    .reps(toInt(m.get("reps"), 0))
                    .durationSec(toInt(m.get("durationSec"), 0))
                    .restSec(toInt(m.get("restSec"), 60))
                    .notes(str(m.get("notes"), ""))
                    .build());
        }
        return ex;
    }

    @SuppressWarnings("unchecked")
    private List<NutritionPlan.Meal> parseMeals(Object raw) {
        List<NutritionPlan.Meal> meals = new ArrayList<>();
        if (!(raw instanceof List<?> list)) return meals;
        for (Object o : list) {
            if (!(o instanceof Map<?, ?> m)) continue;
            List<String> ings = new ArrayList<>();
            if (m.get("ingredients") instanceof List<?> il) il.forEach(x -> ings.add(String.valueOf(x)));
            meals.add(NutritionPlan.Meal.builder()
                    .name(str(m.get("name"), ""))
                    .description(str(m.get("description"), ""))
                    .calories(toInt(m.get("calories"), 0))
                    .ingredients(ings)
                    .build());
        }
        return meals;
    }

    private static String str(Object o, String def) { return o == null ? def : String.valueOf(o); }
    private static int toInt(Object o, int def) {
        if (o instanceof Number n) return n.intValue();
        try { return o == null ? def : Integer.parseInt(String.valueOf(o)); } catch (Exception e) { return def; }
    }
    private static String safe(String s) { return s == null ? "" : s; }
}
