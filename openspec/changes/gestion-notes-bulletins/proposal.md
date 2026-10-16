# Proposal

## Why

L'application SchoolCI est actuellement un squelette Angular SSR sans fonctionnalité métier. Les écoles ont besoin de saisir des notes, de calculer des moyennes et de publier des bulletins de manière fiable et traçable ; sans outil dédié, ces calculs sont faits manuellement dans des tableurs, source d'erreurs de calcul (moyennes pondérées, rangs) et de lenteurs administratives. Ce change apporte le cœur fonctionnel de l'application : gestion des acteurs scolaires, saisie des notes et génération des bulletins.

## What Changes

- Ajout du module d'authentification (inscription, connexion, déconnexion, mots de passe hashés bcrypt) et de la gestion des rôles (`admin`, `teacher`, `student`) avec contrôle d'accès par rôle.
- Ajout du référentiel pédagogique : CRUD des élèves, enseignants, classes, matières et affectations enseignants (matière × classe), géré par l'administrateur, avec recherche et filtres sur les élèves.
- Ajout de la saisie des notes réservée aux enseignants (leurs matières et leurs classes uniquement), avec contrôle des bornes (0–20), calcul des moyennes par matière, moyennes générales pondérées et appréciations selon la barème officielle.
- Ajout des bulletins scolaires : un bulletin par élève et par trimestre (3 trimestres/année), rang dans la classe, appréciation générale, génération PDF, publication par l'administrateur et consultation par l'élève.
- Ajout du tableau de bord : moyennes par classe, taux de réussite, top 10 des élèves et mentions.
- Ajout de la persistance PostgreSQL (Neon) via un backend Node.js/Express séparé exposant une API REST, remplaçant toute idée de backend Firebase.
- Déploiement cible : frontend Angular SSR sur Vercel + backend Node.js/Express séparé (CORS).

## Capabilities

### New Capabilities

- `user-auth`: Inscription, connexion, déconnexion, hash bcrypt des mots de passe, émission de session, identification des rôles (admin, teacher, student) et règles d'autorisation transverses (un enseignant n'accède qu'à ses matières/classes, un élève qu'à ses propres données).
- `school-structure`: Référentiel pédagogique administratif : CRUD élèves, classes, matières, affectations enseignants, recherche et filtres sur les élèves.
- `grade-management`: Saisie et gestion des notes par les enseignants, recherche/filtres sur les notes, calcul des moyennes par matière et de la moyenne générale pondérée, appréciations.
- `report-cards`: Bulletins par trimestre : agrégation des moyennes, calcul du rang dans la classe, génération PDF, publication par l'administrateur, consultation par l'élève, recherche/filtres sur les bulletins.
- `dashboard`: Tableau de bord statistique : moyennes par classe, taux de réussite, top 10 des élèves, mentions.

### Modified Capabilities

<!-- Aucune capacité existante : la plateforme ne possède encore aucune spec. -->

## Impact

- **Code Angular** : squelette actuel (`src/app/`) — nouveaux modules/routes, composants d'authentification, gestionnaires (élèves, classes, matières, notes, bulletins), tableau de bord, services HTTP, gardes de routage par rôle.
- **API** : création d'un backend Node.js/Express séparé (REST) pour l'authentification et les opérations CRUD/métier, avec CORS configuré.
- **Persistance** : nouveau schéma PostgreSQL sur Neon (utilisateurs, classes, matières, élèves, affectations, notes, bulletins, années/trimestres scolaires).
- **Dépendances** : bcryptjs (hash côté serveur), jsonwebtoken (JWT Bearer), pg (PostgreSQL), librairie de génération PDF (pdfmake), librairie de recherche côté client.
- **Déploiement** : frontend Angular SSR sur Vercel (config `environment.prod.ts`, `vercel.json`) + backend séparé, variables d'environnement côté backend (URL PostgreSQL/Neon, secret JWT, origine CORS).
- **Hors périmètre** : paiement, messagerie, emploi du temps, multi-tenancy multi-écoles (une seule école par instance).
