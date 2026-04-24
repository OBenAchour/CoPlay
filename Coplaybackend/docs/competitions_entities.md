# Documentation des entités - Module Competitions

Ce document résume les classes, enums et relations du package `com.example.coplaybackend.Entities.Competitions`.

## Enums (package .Enums)

- CompetitionType
  - LEAGUE
  - TOURNAMENT

- MatchPhase
  - ALLER, RETOUR, QUART_FINALE, DEMI_FINALE, FINALE

- MatchStatus
  - SCHEDULED, LIVE, FINISHED, CANCELLED

- CompetitionStatus
  - CREATED, CALENDAR_GENERATED, IN_PROGRESS, FINISHED

## Classes

### Competition (abstract)
- Package: `com.example.coplaybackend.Entities.Competitions`
- Annotations: `@Document(collection = "competitions")`, Lombok : `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@SuperBuilder`
- Champs:
  - `String id` (@Id)
  - `String name`
  - `String sport`
  - `LocalDate startDate`
  - `LocalDate endDate`
  - `CompetitionStatus status` (enum dans `Enums`)
  - `CompetitionType type` (enum dans `Enums`)
  - `Integer maxTeams`
  - `User creator` (@DBRef) — `com.example.coplaybackend.Entities.Auth.User`
  - `List<Journee> journees` (@DBRef)
- Rôle: classe parente pour `Ligue` et `Tournoi`.

### Ligue
- Hérite de `Competition`.
- Annotations: `@Document(collection = "competitions")`, Lombok `@SuperBuilder` + `@EqualsAndHashCode(callSuper = true)`
- Champs spécifiques:
  - `Integer pointsPerWin` (default 3)
  - `Integer pointsPerDraw` (default 1)
  - `Integer pointsPerLoss` (default 0)
  - `Integer nbJournees`

### Tournoi
- Hérite de `Competition`.
- Champs spécifiques:
  - `String format` (ex: SINGLE_ELIMINATION)
  - `Integer currentRound`
  - `Integer totalRounds`
  - `Boolean isDoubleLeg` (default false)

### Journee
- Annotations: `@Document(collection = "journees")`, Lombok `@Data`, `@Builder` etc.
- Champs:
  - `String id` (@Id)
  - `Integer numero`
  - `LocalDate datePrevue`
  - `List<MatchCompetition> matchs` (@DBRef)

### MatchCompetition
- Annotations: `@Document(collection = "match_competitions")`, Lombok `@Data`, `@Builder`.
- Champs / Relations:
  - `String id` (@Id)
  - `Competition competition` (@DBRef)
  - `Team equipeA` (@DBRef) — `com.example.coplaybackend.Entities.Teams.Team`
  - `Team equipeB` (@DBRef)
  - `LocalDate dateMatch`
  - `Integer scoreA`, `Integer scoreB`
  - `MatchStatus status` (enum dans `Enums`)
  - `Boolean isValidated`
  - `User validatedBy` (@DBRef)
  - `LocalDateTime validatedAt`
  - `Integer penaltyScoreA`, `Integer penaltyScoreB`
  - `User manOfTheMatch` (@DBRef)
  - `List<MatchEvent> events` (@DBRef)

### MatchEvent
- Document `match_events`.
- Champs:
  - `String id` (@Id)
  - `Integer minute`
  - `User player` (@DBRef)
  - `String type` (ex: GOAL, ASSIST)

### StatistiqueEquipe
- Document `statistiques_equipe`.
- Champs / Relations:
  - `String id` (@Id)
  - `Team equipe` (@DBRef)
  - `Competition competition` (@DBRef)
  - `Integer matchsJoues`
  - `Integer victoires`
  - `Integer defaites`
  - `Integer nuls`
  - `Integer butsPour`
  - `Integer butsContre`
- Index unique: (`teamId`, `competitionId`) pour garantir une statistique par équipe/compétition.

### Classement
- Document `classements`.
- Champs:
  - `String id` (@Id)
  - `Competition competition` (@DBRef)
  - `List<StatistiqueEquipe> table` (@DBRef) — la table doit être triée côté service selon points/différence de buts.

## Notes sur la migration des enums dupliqués
- Des versions dupliquées des enums `MatchStatus` et `CompetitionStatus` existaient dans le package racine `Entities.Competitions` et dans `Entities.Competitions.Enums`.
- Les versions racine ont été marquées `@Deprecated` et gardent une méthode `toNew()` qui convertit vers l'enum du sous-package `Enums` pour compatibilité.
- Recommandation: supprimer les enums dépréciés après avoir mis à jour tous les imports du codebase pour utiliser `...Enums...`.

## Suggestions / Prochaines étapes
- Remplacer progressivement les imports existants par les enums du sous-package `Enums` et supprimer les duplicata / éléments dépréciés lorsque la base de code est propre.
- Implémenter des services pour :
  - générer calendar pour `Ligue` (round-robin)
  - créer les phases et rencontres pour `Tournoi` (arbre à élimination)
  - calculer et mettre à jour `StatistiqueEquipe` et `Classement`
- Ajouter des tests unitaires pour la génération de calendrier et la logique du classement.

---

Fichier généré automatiquement le : 2026-04-09

