# Spec Delta

## Purpose

Permettre l'authentification des trois acteurs de l'école (administrateur, enseignant, élève) et contrôler, à chaque accès, l'autorisation liée au rôle et au périmètre de données propre à l'utilisateur.

## ADDED Requirements

### Requirement: Inscription d'un nouvel utilisateur
Le système SHALL permettre à un visiteur de créer un compte en fournissant un nom, une adresse e-mail unique et un mot de passe. Le compte créé SHALL porter le rôle `student` par défaut ; les comptes `teacher` et `admin` sont créés par un administrateur.

#### Scenario: Inscription réussie
- **WHEN** un visiteur fournit un nom, une adresse e-mail inconnue du système et un mot de passe valide
- **THEN** le compte est créé avec le rôle `student` et une confirmation est retournée

#### Scenario: Adresse e-mail déjà utilisée
- **WHEN** une inscription est tentée avec une adresse e-mail déjà enregistrée
- **THEN** le système refuse l'inscription, signale le conflit et aucun compte n'est créé

#### Scenario: Mot de passe non conforme
- **WHEN** une inscription est soumise avec un mot de passe vide ou trop court
- **THEN** le système refuse avec un message de validation explicite

### Requirement: Connexion et émission de session
Le système SHALL authentifier un utilisateur par adresse e-mail et mot de passe et, en cas de succès, émettre une session portant l'identité et le rôle de l'utilisateur. Tout échec SHALL retourner un message unique « identifiants invalides ».

#### Scenario: Connexion réussie
- **WHEN** un utilisateur fournit des identifiants valides
- **THEN** une session est émise et l'utilisateur accède à l'espace de son rôle

#### Scenario: Mot de passe incorrect
- **WHEN** un mot de passe incorrect est fourni pour un compte existant
- **THEN** la connexion est refusée avec le message « identifiants invalides »

#### Scenario: Compte inexistant
- **WHEN** une adresse e-mail inconnue est utilisée pour se connecter
- **THEN** la connexion est refusée avec le même message « identifiants invalides » que pour un mot de passe incorrect

### Requirement: Déconnexion
Le système SHALL permettre à un utilisateur connecté de mettre fin à sa session. Après déconnexion, toute requête protégée SHALL être refusée.

#### Scenario: Accès après déconnexion
- **WHEN** un utilisateur ayant déconnecté tente d'accéder à une ressource protégée
- **THEN** la requête est refusée avec une erreur d'authentification (401)

### Requirement: Mots de passe hashés
Le système SHALL stocker les mots de passe exclusivement sous forme de hash bcrypt et SHALL vérifier les mots de passe fournis par comparaison de hash, jamais en clair.

#### Scenario: Création ou mise à jour d'un mot de passe
- **WHEN** un mot de passe est défini lors de l'inscription ou d'un changement
- **THEN** seule sa valeur hashée bcrypt est persistée ; le mot de passe en clair n'est ni stocké ni journalisé

#### Scenario: Changement de mot de passe
- **WHEN** un utilisateur change son mot de passe
- **THEN** l'ancien hash est remplacé et l'ancien mot de passe ne permet plus la connexion

### Requirement: Protection des routes et API par rôle
Le système SHALL exiger une session valide pour toute ressource protégée et SHALL refuser l'accès (403) à toute ressource non autorisée pour le rôle de l'utilisateur.

#### Scenario: Utilisateur non authentifié
- **WHEN** une requête protégée est envoyée sans session valide
- **THEN** le système répond 401 et l'utilisateur est redirigé vers la connexion

#### Scenario: Rôle insuffisant
- **WHEN** un élève tente d'accéder à une fonction réservée à l'administrateur, par exemple la publication des bulletins
- **THEN** le système répond 403 sans exécuter l'opération

### Requirement: Périmètre de données de l'élève
Le système SHALL limiter un utilisateur du rôle `student` à la consultation de ses seules notes et bulletins, indépendamment des identifiants demandés.

#### Scenario: Accès aux données d'un autre élève
- **WHEN** un élève demande les notes ou les bulletins d'un autre élève, y compris en connaissant son identifiant
- **THEN** le système refuse l'accès et ne retourne aucune donnée d'autrui

### Requirement: Périmètre de données de l'enseignant
Le système SHALL limiter un utilisateur du rôle `teacher` à ses seules matières et classes, telles que définies par les affectations attribuées par l'administrateur.

#### Scenario: Saisie hors périmètre
- **WHEN** un enseignant tente de saisir ou modifier une note pour une matière ou une classe qui ne lui est pas affectée
- **THEN** le système refuse l'opération (403)

#### Scenario: Retrait d'une affectation
- **WHEN** l'administrateur retire une affectation à un enseignant
- **THEN** cet enseignant ne peut plus consulter ni saisir de notes pour cette matière et cette classe

### Requirement: Gestion des comptes par l'administrateur
Le système SHALL permettre à un administrateur de créer des comptes aux rôles `teacher` et `admin`, de lister les comptes et de désactiver un compte.

#### Scenario: Création d'un compte enseignant
- **WHEN** un administrateur crée un compte avec le rôle `teacher`
- **THEN** le compte est créé avec un mot de passe hashé en bcrypt et apparaît dans la liste des comptes

#### Scenario: Compte désactivé
- **WHEN** un administrateur désactive un compte
- **THEN** toute session existante est refusée et la connexion de ce compte échoue

### Requirement: Expiration de session
Le système SHALL invalider les sessions dont la durée de validité est dépassée et SHALL traiter toute requête portant une session expirée comme non authentifiée.

#### Scenario: Session expirée
- **WHEN** une requête est envoyée avec une session expirée
- **THEN** le système répond 401 et impose une reconnexion
