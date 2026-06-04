# 🎓 Guide de soutenance — Module **Events & Training** (CoPlay)

> Tout ce que tu dois savoir et dire demain : théorie + pratique + tests + CI/CD.

---

## 0. Pitch d'ouverture (à dire en 30 s)

> « Mon module **Events & Training** gère le cycle de vie complet des événements sportifs d'une équipe : création par le capitaine, **inscription des joueurs (RSVP)** avec **liste d'attente intelligente**, **paiement en ligne (Flouci)**, **validation des présences** après l'événement et un **score d'assiduité** qui récompense les joueurs fiables. Il gère aussi les **séances d'entraînement** et les **programmes**. Le tout en Spring Boot + MongoDB côté back, Angular côté front, avec une CI/CD GitHub Actions + Docker. »

---

## 1. Place du module dans le projet

CoPlay = plateforme sportive (4 sous-systèmes) :
- **Auth** (utilisateurs, JWT, rôles)
- **Teams** (équipes, membres)
- **Events & Training** ← **mon module**
- Marketplace / Coaching / Competitions / Messaging (autres modules)

Mon module **dépend** de Auth (User) et Teams (Team) — je les **utilise** (clés étrangères) mais je ne les modifie pas.

---

## 2. Stack technique

| Couche | Technologies |
|---|---|
| Backend | **Java 17**, **Spring Boot 3.2.5**, Spring Web (REST), Spring Data MongoDB, Spring Security (JWT), Spring Scheduling |
| Base de données | **MongoDB** (NoSQL, documents) — MongoDB Atlas en cloud |
| Frontend | **Angular 16**, TypeScript, RxJS, Bootstrap 5, **Leaflet** (cartes OpenStreetMap) |
| Paiement | **Flouci** (passerelle tunisienne, API v2) |
| Build | Maven (back), npm/Angular CLI (front) |
| CI/CD | **GitHub Actions**, **Docker**, Docker Hub, **Prometheus** (monitoring) |

---

## 3. Modèle de données (entités MongoDB)

### 3.1 `Event` (collection `events`)
| Champ | Type | Rôle |
|---|---|---|
| eventId | String `@Id` | identifiant |
| teamId | **Team** | équipe organisatrice (objet Team complet) |
| title, startDate, endDate | String / LocalDateTime | infos |
| locationId | **Location** | lieu (objet Location complet) |
| status | EventStatus | SCHEDULED / ONGOING / COMPLETED / CANCELLED |
| isPublic | Boolean | visible par tous ou équipe seule |
| maxParticipants | Integer | capacité (au-delà → liste d'attente) |
| isPaid, registrationFee, paymentDeadlineHours | Boolean/Double/Integer | paiement |

### 3.2 `EventParticipation` (collection `event_participations`) — **le cœur du module**
Relie **un joueur** à **un événement**. Index unique composé `{eventId, userId}` → un joueur = une seule participation par événement.

| Champ | Type | Rôle |
|---|---|---|
| participationId | String `@Id` | |
| eventId | **Event** | l'événement (objet complet embarqué) |
| userId | **User** | le joueur (objet complet embarqué) |
| rsvpStatus | RSVPStatus | réponse du joueur : PENDING / YES / NO |
| participationStatus | ParticipationStatus | CONFIRMED / WAITING / DECLINED / ABSENT |
| paymentStatus | PaymentStatus | NOT_REQUIRED / PENDING / PAID / EXPIRED / REFUNDED |
| paymentDeadline | LocalDateTime | date limite de paiement |
| flouciPaymentId | String | id transaction Flouci |
| isPresent | Boolean | présence réelle (validée après l'événement) |
| attendanceScore | Integer | **score de fiabilité** (défaut 50) |
| respondedAt | LocalDateTime | |

### 3.3 `Location` (collection `locations`)
locationId, name, address, latitude, longitude (BigDecimal).

### 3.4 `TrainingSession` (collection `training_sessions`)
Séance datée : sessionId, title, sessionDate, duration, teamId, locationId, createdBy, **program** (nullable), status, **isOfficial** (true si liée à un programme).

### 3.5 `TrainingProgram`
Plan d'entraînement réutilisable : titre, niveau, durée, **liste d'exercices** (Exercise embarqués). Pas de RSVP/paiement (c'est un plan, pas un événement).

> **Point théorique important — pourquoi des objets complets et pas des IDs ?**
> En MongoDB (NoSQL), j'embarque les objets référencés (Team, User, Location) directement dans le document. Avantage : lecture rapide sans jointure. Le **DTO** (`EventRequestDTO`) reçoit de simples **IDs** du frontend, et le **contrôleur charge les objets complets** depuis Mongo avant de les enregistrer. C'est le pattern **DTO → entité**.

---

## 4. La logique métier (à MAÎTRISER — c'est ce qui impressionne le jury)

Tout est dans **`EventService.java`**. Voici les règles, dans l'ordre du cycle de vie.

### 4.1 Création d'un événement (`createEvent`)
Règles validées :
1. `startDate` doit être dans le **futur**.
2. `endDate` (optionnelle) doit être **après** `startDate`.
3. Si **payant** : `registrationFee > 0` ET `paymentDeadlineHours > 0` obligatoires.
4. `paymentDeadlineHours` ne peut **pas dépasser** le nombre d'heures avant l'événement (on ne peut pas demander de payer après l'événement).
5. Statut **forcé à SCHEDULED**.

### 4.2 RSVP — réponse du joueur (`respondToEvent`)
Seulement si l'événement est **SCHEDULED**. Selon la réponse :
- **YES** → `applyYesLogic` :
  - On compte les CONFIRMED. S'il **reste de la place** → **CONFIRMED**, sinon → **WAITING** (liste d'attente).
  - Si payant → `paymentStatus = PENDING` + calcul de la **deadline** (= maintenant + paymentDeadlineHours). Sinon `NOT_REQUIRED`.
- **NO** → **DECLINED**, paiement remis à NOT_REQUIRED. Si le joueur était CONFIRMED, sa place se libère → **promotion** du prochain en attente.

### 4.3 Liste d'attente priorisée (`promoteNextWaiting`)
Quand une place se libère, on promeut le joueur WAITING **avec le meilleur `attendanceScore`** (les joueurs fiables passent devant). C'est le tri `OrderByAttendanceScoreDesc`.

### 4.4 Paiement (`confirmPayment`)
- Exige `paymentStatus = PENDING`.
- Si **deadline dépassée** → `EXPIRED`, le joueur repasse WAITING, on promeut le suivant, et on lève une erreur.
- Sinon → **PAID**.

### 4.5 Expiration automatique (`expireOverduePayments`) — **planifiée**
Méthode annotée **`@Scheduled`** (toutes les 15 min). Cherche les paiements PENDING dont la deadline est passée → les passe en EXPIRED, libère la place, promeut le suivant. Activée par **`@EnableScheduling`** dans `EventSchedulingConfig` (dans mon module).

### 4.6 Annulation de participation (`cancelRsvp`)
Endpoint dédié `DELETE /rsvp/delete/...`. Supprime la participation ; si le joueur était CONFIRMED → promotion automatique du suivant. Bloqué si l'événement n'est plus SCHEDULED.

### 4.7 Validation des présences + score (`validatePresence`)
- Uniquement quand l'événement est **COMPLETED**.
- **Présent** → `attendanceScore + 5` (plafond 100).
- **Absent** → statut **ABSENT** + `attendanceScore - 10` (plancher 0).
- Le score influence la priorité en liste d'attente des futurs événements → **boucle vertueuse** : les joueurs fiables sont récompensés.

### 4.8 Annulation d'événement payant (`cancelEvent`)
- Bloqué si COMPLETED/CANCELLED.
- Si payant → tous les **PAID passent à REFUNDED** (remboursement).
- Statut → CANCELLED, suppression des participations non remboursées.

### 4.9 Taux d'assiduité (`getAttendanceRate`)
`(nb de présences confirmées / nb total de participations) × 100`.

---

## 5. Les enums (statuts)

| Enum | Valeurs |
|---|---|
| **EventStatus** | SCHEDULED, ONGOING, COMPLETED, CANCELLED |
| **RSVPStatus** | PENDING, YES, NO |
| **ParticipationStatus** | CONFIRMED, WAITING, DECLINED, ABSENT |
| **PaymentStatus** | NOT_REQUIRED, PENDING, PAID, EXPIRED, REFUNDED |

---

## 6. Les endpoints REST (base `/api/events`)

| Méthode | URI | Rôle |
|---|---|---|
| GET | `/all`, `/get/{id}`, `/get/team/{teamId}`, `/get/public` | lectures |
| POST | `/add` | créer (DTO) |
| PUT | `/update/{id}` | modifier (DTO) |
| PUT | `/update/{id}/status?status=` | changer le statut |
| DELETE | `/delete/{id}` | annuler (+ remboursements) |
| POST | `/rsvp/add/{eventId}/{userId}?status=` | RSVP |
| DELETE | `/rsvp/delete/{eventId}/{userId}` | **annuler sa participation** |
| GET | `/participations/get/{eventId}` | liste des participants |
| PUT | `/payment/confirm/{eventId}/{userId}` | paiement (démo/simulation) |
| POST | `/payment/initiate/{eventId}/{userId}` | **initier paiement Flouci** |
| PUT | `/payment/verify/{eventId}/{userId}` | **vérifier paiement Flouci** |
| PUT | `/presence/update/{eventId}/{userId}?isPresent=` | valider présence |
| GET | `/stats/attendance/{userId}` | taux d'assiduité |

**Training Sessions** (`/api/training-sessions`) : `/add`, `/all`, `/get/{id}`, `/get/team/{teamId}`, `/get/team/{teamId}/upcoming`, `/update/{id}`, `/cancel/{id}`, `/complete/{id}`, `/delete/{id}`.
**Locations** (`/api/locations`) : `/add`, `/all`, `/get/{id}`, `/search?name=`.

> Sécurité : tous les endpoints `/api/events/**` exigent un **JWT** (Spring Security). Le contrôle « admin seulement » pour créer/valider se fait côté front via `authService.isAdmin()`.

---

## 7. Le frontend (Angular)

### Composants clés (dossier `Features/Event & Training/`)
- **event-list** : liste des événements.
- **event-form** : création/édition (formulaire réactif + validations + **carte Leaflet** pour choisir le lieu via recherche d'adresse Nominatim ou clic sur la carte).
- **event-detail** : détail + **boutons RSVP** (Je participe / Je ne participe pas), carte du lieu, **carte paiement** + **bouton Payer**, **bouton Annuler ma participation**, listes Confirmés / File d'attente, **validation des présences** (admin), **carte « Votre assiduité »**.
- **map** : composant carte Leaflet réutilisable (lecture seule ou sélection).
- **training-list / training-session-form / training-session-detail / training-program-*** : séances et programmes.

### Services (`Core/Services/Events & Training/`)
- **EventService** : appels REST + **normalisation** (le back renvoie le lieu sous `locationId`, on le remappe en `location`) + récupération de l'`userId` via `/api/users/me`.
- **LocationService** : géocodage Nominatim (gratuit, OpenStreetMap) + CRUD location + lien Google Maps.

### Flux « Je participe → Payer » (à savoir raconter)
```
Clic "Je participe" → POST /rsvp/add (YES)
  → gratuit : CONFIRMED, fin
  → payant  : CONFIRMED + paiement PENDING + deadline
       → bouton "Payer" → (Flouci) initiate → page Flouci → verify → PAID
  → plein   : WAITING (file d'attente, priorité au score)
```

---

## 7 bis. Le volet TRAINING (à ne pas oublier — fait partie de ton module)

Ton module = **Events ET Training**. Le training a **deux concepts complémentaires** :

### A. `TrainingProgram` — le *plan* d'entraînement (réutilisable)
Un modèle d'entraînement non daté, créé par un coach/admin.
- Champs : programId, **teamId** (Team), **coachId** (auteur), title, **level** (BEGINNER…PROFESSIONAL), duration (min), **exercises** (liste d'`Exercise` embarqués : nom, description, vidéo), recommendedEquipmentIds (lien vers Marketplace).
- Collection : `training_programs`.
- Endpoints `/api/training` : `/add`, `/all`, `/get/{id}`, `/get/team/{teamId}`, **`/get/level/{level}`**, `/update/{id}`, `/delete/{id}`, et gestion des exercices : `/exercises/add/{programId}`, `/exercises/update/{programId}/{exerciseId}`, `/exercises/delete/{programId}/{exerciseId}`.

### B. `TrainingSession` — la *séance* datée (ce que l'équipe fait réellement)
- Champs : sessionId, title, description, **sessionDate**, duration, teamId, locationId, **createdBy**, **program** (nullable), status, **isOfficial**.
- Règle clé : **`isOfficial = (program != null)`**.
  - **Séance officielle** = liée à un programme → créée par **coach/admin**.
  - **Séance libre** = sans programme → créée par **n'importe quel membre** de l'équipe.
- Règles métier (`TrainingSessionService`) : `sessionDate` dans le futur ; statut **SCHEDULED → COMPLETED / CANCELLED** ; modification interdite si la séance n'est plus SCHEDULED ; `complete()` n'agit que sur une séance SCHEDULED.
- Endpoints `/api/training-sessions` : `/add`, `/all`, `/get/{id}`, `/get/team/{teamId}`, **`/get/team/{teamId}/upcoming`**, `/update/{id}`, `/cancel/{id}`, `/complete/{id}`, `/delete/{id}`.
- Collection : `training_sessions`.

### Différence Events vs Training (phrase clé pour le jury)
> « Un **Event** est un match/rassemblement avec **inscription, paiement et présence**. Une **TrainingSession** est une séance d'entraînement datée (officielle si elle applique un **TrainingProgram**, libre sinon) — elle a un cycle de statut mais **pas de RSVP/paiement**. Le **TrainingProgram** est le plan réutilisable (exercices) qu'une séance officielle applique. »

### CRUD Training testé (à dire)
J'ai validé via l'API le CRUD complet des séances : create (SCHEDULED), read (all/id/team/upcoming), update, complete, cancel, delete (suppression physique).

### ⭐ FONCTION MÉTIER du Training — Recommandation par niveau
Pour que Training ne soit pas que du CRUD, j'ai ajouté une **logique métier de recommandation** :
- **Règle** : le système recommande au joueur les programmes dont le `level` correspond à **son niveau sportif** (lu dans son profil : BEGINNER / INTERMEDIATE / ADVANCED / PROFESSIONAL). Si le niveau est absent → on renvoie tous les programmes.
- **Backend** : `TrainingService.getRecommendedProgramsForUser(User)` + endpoint **`GET /api/training/recommended/{userId}`** (charge l'utilisateur, lit `profile.level`, filtre via `findByLevel`).
- **Frontend** : bouton **« ⭐ Recommandés pour mon niveau »** dans la liste des programmes (récupère l'userId via `/api/users/me`, affiche le niveau).
- **Inter-modules** : utilise la donnée `User.profile.level` du module **Auth** sans le modifier.
- **Testé** : un joueur INTERMEDIATE ne reçoit que les programmes INTERMEDIATE.

> Phrase jury : « Ma fonction métier Training, c'est une **recommandation personnalisée** : chaque joueur voit les programmes adaptés à son niveau, en croisant la donnée de niveau du module Auth avec les programmes de mon module. »

---

## 8. Paiement Flouci (théorie + intégration)

- **Flouci** = passerelle de paiement tunisienne (wallet + cartes), agréée par la Banque Centrale de Tunisie.
- **Coût** : intégration et **mode test gratuits** ; en production commission **1,3 % HT** (carte/wallet local) / **3 % HT** (carte internationale), sans frais fixes ni abonnement.
- **API v2** : 
  - `POST /generate_payment` (montant en **millimes**, success_link, fail_link) → renvoie `link` + `payment_id`.
  - `GET /verify_payment/{id}` → `status == "SUCCESS"`.
  - Auth : header `Authorization: Bearer <PUBLIC>:<PRIVATE>`.
- **Mon implémentation** : `FlouciPaymentService` (Services/Events) + endpoints `initiate` / `verify` ; le `payment_id` est stocké sur la participation pour la vérification au retour. Les jetons sont lus via variables d'environnement (pas en dur). Le `confirmPayment` simulé est gardé comme repli de démo.

---

## 9. Les TESTS (ce qui tourne au merge)

### 9.1 Backend
- Fichier : `CoplaybackendApplicationTests.contextLoads()` — **test d'intégration Spring** : démarre tout le contexte Spring avec le profil `test` (Mongo local, secrets factices). S'il passe, ça prouve que **tout le câblage (beans, repositories, config) est correct**.
- Lancé par **`mvn verify`** dans la CI.
- Profil test : `application-test.properties` (Mongo `coplay_test`, clés Stripe/AWS factices).

### 9.2 Frontend
- Tests **Karma + Jasmine** (`.spec.ts`), lancés en **Chrome headless** : `npm test -- --watch=false --browsers=ChromeHeadless`.
- En CI, `continue-on-error: true` → les tests ne **bloquent pas** le pipeline (tolérance, car beaucoup de specs sont les specs par défaut générées par Angular CLI).

### 9.3 Mes tests fonctionnels (à mentionner)
J'ai validé le module **bout en bout via l'API** (scénarios : création, RSVP YES/NO, file d'attente, promotion, paiement, présence/score, annulation+remboursement, CRUD Event + Training). → preuve que la logique métier se comporte exactement comme spécifié.

---

## 10. CI/CD (GitHub Actions + Docker)

### 3 workflows séparés, déclenchés par **chemin modifié** (`paths:`)
- `backend-ci.yml`, `frontend-ci.yml`, `ml-ci.yml`.
- Déclencheurs : **push** et **pull_request** → donc **au merge / à l'ouverture d'une PR**, la CI tourne automatiquement.

### Pipeline Backend (`backend-ci.yml`)
1. Checkout du code.
2. **Java 17** (Temurin) + cache Maven.
3. **Service MongoDB 7** lancé en conteneur (port 27017) pour les tests.
4. **`mvn verify`** (compile + tests) avec `MONGODB_URI` vers le Mongo de CI.
5. **`docker build`** de l'image backend (Dockerfile multi-étapes).
6. **Push Docker Hub** uniquement si **branche `main`** + event `push` (pas sur les PR).

### Pipeline Frontend (`frontend-ci.yml`)
1. Checkout.
2. **Node 18** + cache npm.
3. `npm ci` (install propre).
4. **Tests headless** (non bloquants).
5. **`npm run build --configuration production`**.
6. `docker build` + push Docker Hub (sur `main`).

### Pipeline ML (`ml-ci.yml`)
Python 3.11 (service de vision/IA, hors de mon module).

### Docker
- **Dockerfile backend** = **multi-stage** : étape 1 Maven (build du `.jar`), étape 2 image légère `temurin-17-jre-alpine` qui ne garde que le jar → **image finale petite**. Expose 8080.
- **docker-compose.yml** : orchestre **backend + frontend + ml + mongodb + prometheus**. Healthcheck backend sur `/actuator/health`. Volume persistant pour Mongo. Secrets via variables d'environnement.
- **Prometheus** scrape les métriques (`/actuator/prometheus`) → **monitoring**.

> Théorie à dire : **CI** = intégration continue (build + tests auto à chaque push/PR). **CD** = livraison continue (image Docker construite et poussée sur Docker Hub automatiquement sur `main`). Les **path filters** évitent de relancer toute la CI si seul un module change.

---

## 11. Bugs trouvés & corrigés (montre ta rigueur — le jury adore)

1. **Requêtes participations cassées après changement de statut** : les finders cherchaient par **objet Event entier** (embarqué et figé) ; après passage en COMPLETED, plus aucune correspondance → présences/listing KO. **Fix** : requêtes par **id imbriqué** (`eventId.eventId`).
2. **Création d'événement sans date de fin → crash 400** (NullPointerException) : `endDate` optionnelle non protégée. **Fix** : garde `endDate != null`.
3. **Carte Leaflet « pas claire »** : le **CSS de Leaflet n'était pas chargé**. **Fix** : import de `leaflet.css` via le composant carte (`ViewEncapsulation.None`).
4. **Impossible de participer en tant que player** : l'`userId` n'est ni dans la réponse de login ni dans le JWT → `getUserId()` renvoyait vide. **Fix** : récupération via `GET /api/users/me`.
5. **Lieu non affiché dans le détail** : le back renvoie `locationId`, le front lisait `location`. **Fix** : normalisation dans `EventService` (front).

---

## 12. Questions probables du jury + réponses

- **« Pourquoi MongoDB et pas SQL ? »** → Données semi-structurées, documents auto-suffisants (participation contient event + user embarqués), lecture rapide sans jointures, flexibilité du schéma.
- **« Comment garantissez-vous qu'un joueur n'a qu'une inscription ? »** → Index **unique composé** `{eventId, userId}` sur la collection.
- **« Comment gérez-vous la concurrence sur la dernière place ? »** → On compte les CONFIRMED au moment du YES ; au-delà de `maxParticipants` → WAITING ; promotion automatique quand une place se libère.
- **« Et si le joueur ne paie pas ? »** → Deadline + tâche **planifiée** qui expire le paiement et promeut le suivant.
- **« Le paiement est-il réel ? »** → Intégration **Flouci** (sandbox gratuit) ; fallback simulé pour la démo.
- **« Vos tests ? »** → Test d'intégration Spring (`contextLoads`) en CI avec Mongo conteneurisé + tests Angular headless + validation fonctionnelle API bout en bout.
- **« Votre CI/CD ? »** → 3 workflows GitHub Actions par module, build+test à chaque PR/push, build & push d'images Docker sur `main`, orchestration docker-compose, monitoring Prometheus.
- **« Sécurité ? »** → JWT + Spring Security ; tous les endpoints events authentifiés ; actions admin filtrées côté front.

---

## 13. Plan de démo live (5 min)

1. Se connecter (player). Ouvrir un événement **payant**.
2. Cliquer **Je participe** → montrer **CONFIRMED + paiement En attente** + deadline.
3. Cliquer **Payer** → statut **Payé**.
4. (Admin) Passer l'événement **COMPLETED** → **valider la présence** → montrer le **score** qui augmente.
5. Montrer la **carte du lieu** (Leaflet) dans le détail et la création.
6. Montrer la **file d'attente** sur un événement à 1 place (2e joueur en WAITING, promotion quand le 1er annule).
7. (Si demandé) Montrer la **CI verte** sur GitHub Actions + les **images sur Docker Hub**.

---

### 🔑 Les 5 phrases à retenir absolument
1. « Le cœur du module, c'est l'entité **EventParticipation** qui porte RSVP, statut, paiement, présence et score. »
2. « La **liste d'attente est priorisée par le score d'assiduité** : les joueurs fiables passent devant. »
3. « Le **paiement a une deadline** et une **tâche planifiée** l'expire automatiquement. »
4. « La **CI** build + teste à chaque PR avec un **MongoDB conteneurisé**, la **CD** pousse les images Docker sur `main`. »
5. « J'ai validé la logique **bout en bout** et corrigé plusieurs bugs réels (requêtes Mongo, carte Leaflet, récupération de l'userId). »
