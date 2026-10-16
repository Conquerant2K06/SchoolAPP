# Design

## Context

Le dépôt est un squelette Angular 17.3 avec SSR (`server.ts`, `@angular/ssr`), sans aucune fonctionnalité métier ni spec existante (voir proposal.md - Why). Le frontend Angular est déployé sur Vercel ; la persistance PostgreSQL (Neon) et la logique métier/authentification sont portées par un **backend séparé Node.js/Express** exposant une API REST consommée par le frontend via CORS. Les exigences de comportement sont détaillées dans les deltas de `specs/` (`user-auth`, `school-structure`, `grade-management`, `report-cards`, `dashboard`) ; ce document fixe les décisions techniques pour les implémenter.

## Goals / Non-Goals

**Goals:**
- Définir l'architecture frontend Angular + backend Express + PostgreSQL (base Neon), avec séparation nette des responsabilités.
- Placer le calcul des moyennes, appréciations et rangs sur une source unique côté backend, testable.
- Sécuriser par rôle et par périmètre (enseignant limité à ses affectations, élève à ses données) côté backend, le front n'étant qu'une couche de confort.
- Fournir un modèle de données et un découpage de tâches par 6 phases, chacune livrable et testable indépendamment.

**Non-Goals:**
- Multi-tenancy (plusieurs établissements), notifications e-mail, emploi du temps, paiement.
- Synchronisation temps réel, mode hors-ligne.
- Généralisation du barème (le barème d'appréciation est fixe, codé en dur).

## Decisions

1. **Backend séparé Node.js/Express (API REST)**
   Un projet backend Express autonome expose des routes REST consommées par le frontend Angular. *Alternatives :* Vercel Serverless Functions (écartées : le choix retenu est un backend séparé, plus simple à tester et à exécuter localement avec un pool de connexions), backend Nest/Adonis (écartés : Express suffit pour un CRUD REST simple), Firebase (rejeté explicitement par l'utilisateur).

2. **Persistance : PostgreSQL (Neon) via un pool `pg`**
   Le backend Express est un processus long : il utilise un `pg.Pool` et des requêtes SQL paramétrées écrites à la main ; migrations SQL versionnées dans `migrations/` appliquées par script npm. *Alternatives :* `@neondatabase/serverless` (écarté : optimisé pour le serverless, inutile avec un serveur persistant), Prisma/Drizzle (écartés : surcouche inutile pour un schéma ~8 tables).

3. **Authentification : JWT transmis en en-tête `Authorization: Bearer`**
   À la connexion, le backend renvoie un jeton JWT signé (identité + rôle). Le frontend le stocke (signal + persistance navigateur) et l'`HttpInterceptor` l'injecte dans chaque requête. Le mot de passe est haché avec bcrypt (10 rounds) via `bcryptjs`. *Alternatives :* cookie `httpOnly` (écarté : avec un backend sur une origine distincte, le cookie cross-site impose `SameSite=None` + credentials CORS, plus complexe que le Bearer), sessions serveur (écartées : inutilement stateful).

4. **Sécurité : l'autorisation est appliquée côté backend uniquement**
   Middlewares Express en trois niveaux : (a) vérification/expiration du JWT, (b) contrôle du rôle autorisé, (c) vérification en base du périmètre (affectation enseignant → couple matière/classe ; élève → propres identifiants). CORS n'autorise que l'origine du frontend. Côté Angular : `AuthGuard` (`CanMatch`) + `RoleGuard` + intercepteur 401/403 — purement ergonomiques, jamais source de vérité.

5. **Calculs métier : source unique côté backend**
   Moyennes par matière et moyenne générale : agrégation SQL (`SUM(note*coef)/SUM(coef)`) arrondie à 2 décimales. Rang : fonction de fenêtre `RANK() OVER (PARTITION BY classe, trimestre ORDER BY moyenne_generale DESC)` — produit exactement le classement 1, 1, 3 exigé pour les ex æquo. Appréciation : module TypeScript pur (`appreciation(moyenne)`) réutilisé par bulletins et dashboard, unit-testable. Le client n'affiche que des résultats déjà calculés.

6. **Bulletins : ligne d'état + contenu calculé à la demande**
   La table `report_cards` ne stocke que (élève, trimestre, année, statut, publié_par/le). Tout le contenu (moyennes, appréciation, rang) est recalculé à chaque affichage/génération PDF depuis les notes courantes : conformité à la règle de régénération sans doublon et pas de données périmées après correction d'une note. *Alternative :* instantané matérialisé (écartée : risque d'incohérence avec les notes corrigées).

7. **PDF : génération côté backend avec `pdfmake`**
   `GET /api/report-cards/:id/pdf` renvoie `application/pdf` en reprenant les mêmes données que l'affichage. *Alternatives :* jsPDF côté client (écarté : duplique la logique et expose le calcul), Puppeteer (écarté : trop lourd).

8. **Front : Angular 17.3 standalone, Signals et Reactive Forms**
   `src/app/core/` (auth service, intercepteur, gardes), `src/app/features/` (`auth`, `school`, `grades`, `reports`, `dashboard`), `src/app/shared/` (recherche/filtres), routing lazy par feature, signaux pour l'état d'auth, formulaires réactifs, styles SCSS. L'URL de l'API est fournie par `environment.ts` (dev) et `environment.prod.ts` (prod) via `apiUrl` ; aucun service ne code d'URL en dur. Recherche/filtres : query params d'URL + requêtes côté backend avec pagination.

9. **Schéma de données (tables principales)**
   `users` (id, email unique, password_hash, full_name, role, active, class_id nullable), `classes`, `subjects` (coefficient), `school_years` (3 trimestres en colonnes ou table `trimesters`), `teacher_assignments` (teacher_id, subject_id, class_id, unique), `notes` (student_id, subject_id, class_id, school_year, trimester, value, coefficient), `report_cards` (student_id, school_year, trimester, status, published_by/at, unique). Index sur `notes(class_id, subject_id, student_id, trimester)` et `users(class_id, role)`.

10. **Bootstrap administrateur, CORS et déploiement**
    Premier compte `admin` créé par script de migration/seed (identifiants via variables d'environnement du backend), les suivants par l'admin (spec `user-auth`). Le backend configure CORS avec l'origine du frontend (`FRONTEND_ORIGIN`) et valide ses variables (`DATABASE_URL`, `JWT_SECRET`, `SEED_ADMIN_*`). Déploiement : frontend Angular SSR sur Vercel (`environment.prod.ts`, `vercel.json`), backend séparé (hôte Node) ; rollback par version de déploiement. Aucune donnée existante à migrer (greenfield).

## Risks / Trade-offs

- [Jeton Bearer lisible par le JS (XSS)] → en-têtes sûrs, échappement, expiration courte du jeton ; ne jamais journaliser le jeton ; possibilité d'évoluer vers cookie `httpOnly` si le backend et le front partagent un domaine.
- [Mauvais réglage CORS] → liste d'origines explicite (`FRONTEND_ORIGIN`), pas de `*` en production, en-têtes limités (`Authorization`, `Content-Type`).
- [Fuite de données privées dans le HTML SSR] → espaces authentifiés en rendu client uniquement ; vérifier qu'aucune route protégée n'est pré-rendue.
- [Contournement des gardes front par appel API direct] → autorisation recalcule le périmètre en base à chaque requête ; les tests ciblent les refus 401/403 côté API.
- [Bulletin publié puis note corrigée] → comportement assumé : le bulletin affiché/PDF est toujours recalculé à la demande (toujours à jour) ; aucune « gel » historique — à réévaluer si un besoin de traçabilité des bulletins figés émerge.
- [bcryptjs plus lent que bcrypt natif] → acceptable à l'échelle d'une école (auth rare) ; 10 rounds à l'inscription/connexion uniquement.
- [Calculs dupliqués (bulletins + dashboard)] → partage du même module de calcul côté backend pour garantir l'identité des résultats.

## Open Questions

- Mise en page exacte du PDF du bulletin (en-tête/logo de l'établissement, signature) — décision visuelle sans incidence sur les specs, l'approche ou le découpage des tâches.
