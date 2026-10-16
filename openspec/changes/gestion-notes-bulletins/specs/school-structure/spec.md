# Spec Delta

## Purpose

Constituer et maintenir le référentiel pédagogique sur lequel reposent la saisie des notes et les bulletins : années scolaires et trimestres, classes, matières, élèves et affectations des enseignants.

## ADDED Requirements

### Requirement: Structure de l'année scolaire
Le système SHALL organiser le temps scolaire en années scolaires comportant chacune exactement 3 trimestres ordonnés. Une seule année scolaire SHALL être désignée active pour la saisie courante.

#### Scenario: Création d'une année scolaire
- **WHEN** un administrateur crée une année scolaire
- **THEN** ses trois trimestres sont créés automatiquement et numérotés de 1 à 3

#### Scenario: Saisie ciblant l'année active
- **WHEN** un enseignant saisit une note pendant que l'année scolaire active est l'année en cours
- **THEN** la note est rattachée à l'année active et au trimestre indiqué

### Requirement: Gestion des classes par l'administrateur
Le système SHALL permettre à l'administrateur de créer, modifier et supprimer des classes (nom, niveau). La suppression d'une classe contenant encore des élèves affectés SHALL être refusée.

#### Scenario: Création d'une classe
- **WHEN** un administrateur crée une classe avec un nom et un niveau
- **THEN** la classe apparaît dans la liste des classes et devient disponible pour l'affectation des élèves

#### Scenario: Suppression d'une classe occupée
- **WHEN** un administrateur tente de supprimer une classe à laquelle des élèves sont affectés
- **THEN** la suppression est refusée avec un message indiquant que la classe contient encore des élèves

### Requirement: Gestion des matières par l'administrateur
Le système SHALL permettre à l'administrateur de créer, modifier et supprimer des matières. Une matière SHALL posséder un nom, un code unique et un coefficient strictement positif.

#### Scenario: Création d'une matière
- **WHEN** un administrateur crée une matière avec un nom, un code unique et un coefficient
- **THEN** la matière est enregistrée et utilisable pour les affectations et les notes

#### Scenario: Coefficient invalide
- **WHEN** une matière est créée ou modifiée avec un coefficient nul ou négatif
- **THEN** le système refuse l'opération avec un message de validation

### Requirement: Gestion des élèves par l'administrateur
Le système SHALL permettre à l'administrateur de créer, modifier et supprimer des élèves, et de les affecter à une classe. La suppression d'un élève possédant déjà des notes SHALL être refusée.

#### Scenario: Création d'un élève affecté à une classe
- **WHEN** un administrateur crée un élève et le rattache à une classe
- **THEN** l'élève est enregistré et apparaît dans l'effectif de cette classe

#### Scenario: Suppression d'un élève ayant des notes
- **WHEN** un administrateur tente de supprimer un élève pour lequel des notes existent
- **THEN** la suppression est refusée pour préserver l'intégrité des données de notation

### Requirement: Affectation des enseignants
Le système SHALL permettre à l'administrateur d'affecter un enseignant à des couples (matière, classe) et de retirer ces affectations, sans créer de doublon pour un couple donné.

#### Scenario: Création d'une affectation
- **WHEN** un administrateur affecte un enseignant à une matière et une classe
- **THEN** l'enseignant peut immédiatement saisir et consulter les notes de cette matière pour cette classe

#### Scenario: Affectation déjà existante
- **WHEN** un administrateur tente d'affecter un enseignant à un couple (matière, classe) déjà affecté
- **THEN** aucun doublon n'est créé et l'état reste inchangé

### Requirement: Recherche et filtres sur les élèves
Le système SHALL permettre de rechercher les élèves par fragment de nom ou de prénom, sans tenir compte de la casse, et de les filtrer par classe et par année scolaire.

#### Scenario: Recherche par nom partiel
- **WHEN** un administrateur saisit un fragment de nom
- **THEN** la liste retournée contient tous les élèves dont le nom ou le prénom correspond, quelle que soit la casse

#### Scenario: Filtre par classe
- **WHEN** un administrateur filtre les élèves par classe
- **THEN** seuls les élèves affectés à cette classe sont affichés

#### Scenario: Filtre combiné classe et année scolaire
- **WHEN** les filtres classe et année scolaire sont appliqués ensemble
- **THEN** seuls les élèves de cette classe pour cette année scolaire sont affichés
