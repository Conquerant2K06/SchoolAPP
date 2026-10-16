# Tasks

> Architecture retenue : frontend **Angular 17.3** (standalone components, Signals, Reactive Forms, SCSS, SSR) déployé sur **Vercel** ; **backend séparé Node.js/Express + PostgreSQL + JWT (Bearer)** avec **CORS** ; URL d'API via `environment.ts` / `environment.prod.ts`. Chaque phase est indépendante et livrable/testable seule.

## 1. Phase 1 — Authentification et structure de base Angular

### Composants Angular
- [ ] 1.1 Créer le shell applicatif (`AppComponent` + `ShellComponent` avec barre de navigation par rôle et `<router-outlet>`) ; vérifier que `npm start` affiche le shell.
- [ ] 1.2 Créer `LoginComponent` (Reactive Forms) dans `src/app/features/auth/` ; vérifier : connexion valide redirige selon le rôle, échec affiche « identifiants invalides » identique pour mauvais mot de passe et compte inconnu.
- [ ] 1.3 Créer `RegisterComponent` (Reactive Forms) ; vérifier : inscription crée un compte `student`, email en double refusé, mot de passe invalide refusé.
- [ ] 1.4 Créer `UnauthorizedComponent` (403) et `NotFoundComponent` (404) ; vérifier la navigation vers ces pages via les gardes.

### Services Angular
- [ ] 1.5 Créer `AuthService` (Signals `currentUser`, `isAuthenticated`, `role`) exposant `register`/`login`/`logout`/`me` ; vérifier la mise à jour des signaux et la restauration de session au rechargement.
- [ ] 1.6 Créer `authInterceptor` (HttpInterceptor fonctionnel) injectant `Authorization: Bearer <jwt>` et gérant 401/403 ; vérifier qu'un appel protégé porte l'en-tête.
- [ ] 1.7 Créer `AuthGuard` (CanMatch) et `RoleGuard` (données de route `roles`) ; vérifier : route protégée sans session → redirection connexion, mauvais rôle → 403.

### Modèles TypeScript
- [ ] 1.8 Créer `src/app/core/models/user.model.ts` (`User`, `Role = 'admin' | 'teacher' | 'student'`, `Credentials`, `AuthResponse`) ; vérifier la compilation stricte (`npm run build`).
- [ ] 1.9 Créer `environment.ts` et `environment.prod.ts` avec `apiUrl` consommée par tous les services ; vérifier qu'aucune URL d'API n'est codée en dur.

### Endpoints backend (Express)
- [ ] 1.10 `POST /api/auth/register` (hash bcrypt 10 rounds, rôle `student`) ; vérifier 201, 409 email existant, 400 mot de passe invalide.
- [ ] 1.11 `POST /api/auth/login` (JWT signé) et `POST /api/auth/logout` ; vérifier le jeton retourné et le message d'échec unique.
- [ ] 1.12 `GET /api/auth/me` (middleware JWT) ; vérifier 200 avec l'utilisateur, 401 sans jeton / jeton invalide ou expiré.
- [ ] 1.13 `GET/POST/PATCH /api/admin/users` (création `teacher`/`admin`, liste, désactivation, middleware rôle admin) ; vérifier 403 pour non-admin et connexion refusée après désactivation.
- [ ] 1.14 Configurer CORS (origine frontend, méthodes, en-tête `Authorization`) et le middleware d'erreurs centralisé ; vérifier qu'un préflight `OPTIONS` réussit.

### Tests manuels
- [ ] 1.15 Valider le parcours : inscription élève, connexion admin/enseignant/élève, redirection par rôle, déconnexion, accès refusé aux routes protégées.

## 2. Phase 2 — CRUD Admin (élèves, enseignants, classes, matières)

### Composants Angular
- [ ] 2.1 Créer `StudentListComponent` + `StudentFormComponent` (recherche/filtres via query params) dans `src/app/features/school/`.
- [ ] 2.2 Créer `TeacherListComponent` + `TeacherFormComponent`.
- [ ] 2.3 Créer `ClassListComponent` + `ClassFormComponent`.
- [ ] 2.4 Créer `SubjectListComponent` + `SubjectFormComponent`.
- [ ] 2.5 Créer `AssignmentManagerComponent` (affectation enseignant × matière × classe).
- [ ] 2.6 Créer `SchoolYearComponent` (années scolaires + 3 trimestres).

### Services Angular
- [ ] 2.7 Créer `StudentService` (CRUD + filtres) ; vérifier les appels via `apiUrl`.
- [ ] 2.8 Créer `TeacherService`, `ClassService`, `SubjectService`, `AssignmentService`, `SchoolYearService`.

### Modèles TypeScript
- [ ] 2.9 Créer `student.model.ts`, `teacher.model.ts`, `class.model.ts`, `subject.model.ts`, `assignment.model.ts`, `school-year.model.ts` ; vérifier la compilation stricte.

### Endpoints backend (Express)
- [ ] 2.10 CRUD `/api/students` (admin) + filtres nom/classe/année ; vérifier suppression refusée si l'élève a des notes.
- [ ] 2.11 CRUD `/api/teachers` (admin) ; vérifier création/modification/liste.
- [ ] 2.12 CRUD `/api/classes` (admin) ; vérifier suppression refusée si élèves affectés.
- [ ] 2.13 CRUD `/api/subjects` (admin, code unique, coefficient > 0) ; vérifier refus d'un coefficient invalide.
- [ ] 2.14 CRUD `/api/assignments` (enseignant × matière × classe, pas de doublon) ; vérifier l'absence de doublon.
- [ ] 2.15 CRUD `/api/school-years` (création génère 3 trimestres ordonnés, une seule année active).

### Tests manuels
- [ ] 2.16 Valider le CRUD complet depuis l'UI et les contraintes (classe occupée, coefficient invalide, élève noté non supprimable).

## 3. Phase 3 — Saisie des notes par les enseignants

### Composants Angular
- [ ] 3.1 Créer `GradeEntryComponent` (sélection matière/classe du périmètre, tableau des élèves, saisie des notes) dans `src/app/features/grades/`.
- [ ] 3.2 Créer `GradeListComponent` (filtres classe/matière/trimestre/élève + pagination).

### Services Angular
- [ ] 3.3 Créer `GradeService` (CRUD + filtres) ; vérifier via `apiUrl`.
- [ ] 3.4 Créer `TeacherScopeService` (chargement des affectations de l'enseignant connecté pour borner les sélecteurs).

### Modèles TypeScript
- [ ] 3.5 Créer `grade.model.ts` (`Grade`, `GradeInput`, `GradeFilters`).

### Endpoints backend (Express)
- [ ] 3.6 `GET /api/teacher/assignments` (affectations du jeton courant) ; vérifier le filtrage par enseignant.
- [ ] 3.7 `GET/POST/PUT/DELETE /api/grades` avec contrôle d'affectation, élève ∈ classe, bornes 0–20 et coefficient > 0 ; vérifier les refus 403 (hors périmètre) et 400 (valeurs invalides).
- [ ] 3.8 `GET /api/grades` avec filtres classe/matière/élève/trimestre, combinés et pagination ; vérifier chaque filtre.

### Tests manuels
- [ ] 3.9 Valider : un enseignant ne peut saisir que dans ses matières/classes, note 0–20 obligatoire, note refusée pour un élève hors classe.

## 4. Phase 4 — Calcul des moyennes et génération des bulletins PDF

### Composants Angular
- [ ] 4.1 Créer `ReportCardListComponent` (admin : filtres classe/élève/trimestre/statut + action publier) dans `src/app/features/reports/`.
- [ ] 4.2 Créer `ReportCardDetailComponent` (affichage d'un bulletin : matières, moyenne générale, appréciation, rang).
- [ ] 4.3 Créer `ReportCardStudentComponent` (vue élève : ses bulletins publiés uniquement) et le bouton de téléchargement PDF.

### Services Angular
- [ ] 4.4 Créer `ReportCardService` (liste, détail, génération, publication, téléchargement PDF en blob).
- [ ] 4.5 Créer `CalculationService` (affichage des moyennes/appréciations renvoyées par l'API ; aucune règle métier dupliquée côté client).

### Modèles TypeScript
- [ ] 4.6 Créer `report-card.model.ts`, `average.model.ts` (dont `Appreciation` et barème).

### Endpoints backend (Express)
- [ ] 4.7 `GET /api/report-cards` (filtres admin : classe, élève, trimestre, statut) et `GET /api/report-cards/:studentId/:trimester` (contenu calculé + rang).
- [ ] 4.8 `POST /api/report-cards/generate` (unicité élève+trimestre, mise à jour sans doublon).
- [ ] 4.9 `PATCH /api/report-cards/:id/publish` (admin uniquement ; refus si « aucune note enregistrée ») ; vérifier 403 enseignant/élève.
- [ ] 4.10 `GET /api/report-cards/:id/pdf` (pdfmake) ; vérifier que le PDF reprend les mêmes données et que l'accès non autorisé est refusé.
- [ ] 4.11 Module de calcul backend partagé (moyenne par matière, moyenne générale, appréciation) + rang via `RANK()` ; vérifier par tests unitaires (13,33 ; 13,80 ; seuils du barème ; rang 1,1,3).

### Tests manuels
- [ ] 4.12 Valider : moyennes exactes, rang ex æquo 1,1,3, bulletin vide impubliable, visibilité élève selon statut, PDF conforme.

## 5. Phase 5 — Tableau de bord et statistiques

### Composants Angular
- [ ] 5.1 Créer `DashboardComponent` (sélecteurs année/trimestre/classe) dans `src/app/features/dashboard/`.
- [ ] 5.2 Créer `ClassAveragesComponent` (moyennes par classe + effectif).
- [ ] 5.3 Créer `Top10Component` et `MentionsComponent` (répartition des mentions).
- [ ] 5.4 Créer `SuccessRateComponent` (taux de réussite).

### Services Angular
- [ ] 5.5 Créer `DashboardService` (statistiques selon année/trimestre/classe).

### Modèles TypeScript
- [ ] 5.6 Créer `dashboard.model.ts` (`ClassAverage`, `SuccessRate`, `TopStudent`, `MentionCount`).

### Endpoints backend (Express)
- [ ] 5.7 `GET /api/dashboard/stats` (moyennes par classe, taux de réussite ≥10, top 10, mentions) avec restriction de périmètre enseignant ; vérifier 403 pour un élève et le filtrage par classes affectées.

### Tests manuels
- [ ] 5.8 Valider : taux de 70 %, liste partielle si moins de 10 élèves, classe sans note affichée « aucune donnée », enseignant limité à ses classes, élève refusé (403).

## 6. Phase 6 — Recherche, filtres avancés et préparation déploiement Vercel

### Composants Angular
- [ ] 6.1 Créer `SearchBarComponent` et `FilterPanelComponent` réutilisables (recherche/filtres synchronisés avec les query params) dans `src/app/shared/`.
- [ ] 6.2 Intégrer ces composants dans les listes élèves, notes et bulletins.

### Services Angular
- [ ] 6.3 Créer `FilterStateService` (lecture/écriture des query params) et étendre les services concernés avec les paramètres de filtre.

### Modèles TypeScript
- [ ] 6.4 Créer `filter.model.ts` (types de filtres partagés élèves/notes/bulletins).

### Endpoints backend (Express)
- [ ] 6.5 Ajouter les paramètres de recherche/filtres (nom sans casse, classe, matière, trimestre, statut) sur les listes élèves/notes/bulletins ; vérifier par tests les filtres combinés.
- [ ] 6.6 Configurer CORS de production (origines autorisées, en-têtes) et la validation des variables d'environnement du backend.

### Déploiement et vérification
- [ ] 6.7 Renseigner `environment.prod.ts` (`apiUrl` de production) et configurer le déploiement Vercel du frontend Angular SSR ; vérifier l'accès à la connexion sur l'URL de preview.
- [ ] 6.8 Vérifier la sécurité : jeton Bearer, 401/403 sur appels directs, routes protégées non pré-rendues ; documenter le résultat.
- [ ] 6.9 Exécuter le parcours de bout en bout (admin crée classe/matière/élève ; enseignant saisit ; admin publie ; élève consulte) et documenter le résultat.
- [ ] 6.10 Rédiger le README d'exploitation (variables d'environnement front/back, migrations, seed admin, CORS, déploiement et rollback Vercel) ; vérifier que chaque commande documentée s'exécute telle quelle.

## Workflow follow-up

- Archiver le change après satisfaction des exigences de revue du projet.
- Vérifier le résultat archivé (promotion des specs sous `openspec/specs/`).
