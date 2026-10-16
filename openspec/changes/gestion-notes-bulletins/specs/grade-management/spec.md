# Spec Delta

## Purpose

Permettre aux enseignants de saisir, corriger et consulter les notes de leurs seules matières et classes, et calculer les moyennes pondérées ainsi que les appréciations selon le barème de l'établissement.

## ADDED Requirements

### Requirement: Saisie d'une note dans le périmètre de l'enseignant
Le système SHALL permettre à un enseignant de créer une note rattachée à un élève, à une matière, à une classe et à un trimestre de l'année scolaire active, uniquement pour les couples (matière, classe) qui lui sont affectés. L'élève de la note SHALL appartenir à la classe indiquée.

#### Scenario: Saisie valide
- **WHEN** un enseignant saisit une note pour un élève de sa classe et une matière qui lui est affectée, au trimestre en cours
- **THEN** la note est enregistrée et apparaît dans les résultats de recherche des notes

#### Scenario: Saisie hors affectation
- **WHEN** un enseignant tente de saisir une note pour une matière ou une classe qui ne lui est pas affectée
- **THEN** le système refuse l'opération (403) et la note n'est pas enregistrée

#### Scenario: Élève étranger à la classe
- **WHEN** une note est créée pour un élève qui n'appartient pas à la classe indiquée
- **THEN** le système refuse l'opération avec un message d'incohérence

### Requirement: Validation des valeurs de note
Le système SHALL accepter une note comprise entre 0 et 20 et un coefficient strictement positif, et SHALL refuser toute valeur hors bornes.

#### Scenario: Note hors bornes
- **WHEN** une note est soumise avec la valeur 21 (ou -1)
- **THEN** le système refuse la sauvegarde avec un message de validation

#### Scenario: Coefficient invalide
- **WHEN** une note est soumise avec un coefficient nul ou négatif
- **THEN** le système refuse la sauvegarde avec un message de validation

### Requirement: Correction et suppression des notes
Le système SHALL permettre à un enseignant de modifier et de supprimer les notes de ses couples (matière, classe), et à l'administrateur de corriger ou supprimer toute note.

#### Scenario: Correction par l'enseignant
- **WHEN** un enseignant remplace la valeur d'une note qui lui est affectée
- **THEN** la nouvelle valeur est enregistrée et les moyennes concernées sont recalculées

#### Scenario: Correction par l'administrateur
- **WHEN** un administrateur modifie une note dans une classe quelconque
- **THEN** la modification est acceptée sans restriction d'affectation

### Requirement: Recherche et filtres sur les notes
Le système SHALL permettre de filtrer les notes par classe, matière, élève et trimestre, et de combiner ces filtres.

#### Scenario: Filtre classe et matière
- **WHEN** les filtres classe et matière sont sélectionnés ensemble
- **THEN** seules les notes correspondant aux deux filtres sont affichées

#### Scenario: Filtre par trimestre
- **WHEN** un trimestre est sélectionné
- **THEN** seules les notes rattachées à ce trimestre sont affichées

### Requirement: Calcul de la moyenne par matière
Le système SHALL calculer la moyenne d'une matière pour un élève et un trimestre comme la somme des notes multipliées par leurs coefficients, divisée par la somme des coefficients, arrondie à deux décimales.

#### Scenario: Moyenne pondérée
- **WHEN** un élève a 15 (coef 2) et 10 (coef 1) en une matière au trimestre
- **THEN** sa moyenne est (15×2 + 10×1) / (2+1) = 13,33

#### Scenario: Aucune note dans la matière
- **WHEN** un élève n'a aucune note dans une matière au trimestre
- **THEN** aucune moyenne de matière n'est calculée pour cette matière à ce trimestre

### Requirement: Calcul de la moyenne générale
Le système SHALL calculer la moyenne générale d'un élève et d'un trimestre comme la somme des moyennes par matière multipliées par les coefficients de matière, divisée par la somme de ces coefficients, arrondie à deux décimales.

#### Scenario: Moyenne générale pondérée
- **WHEN** un élève a 15 de moyenne en Maths (coef 3) et 12 en Français (coef 2) au trimestre
- **THEN** sa moyenne générale est (15×3 + 12×2) / (3+2) = 13,80

#### Scenario: Aucune note au trimestre
- **WHEN** un élève n'a aucune note au trimestre considéré
- **THEN** aucune moyenne générale n'est calculée pour ce trimestre

### Requirement: Attribution d'une appréciation à une moyenne
Le système SHALL attribuer une appréciation à toute moyenne calculée selon le barème : ≥16 « Très bien », ≥14 « Bien », ≥12 « Assez bien », ≥10 « Passable », <10 « Insuffisant ».

#### Scenario: Moyenne élevée
- **WHEN** une moyenne de 16 ou plus est calculée
- **THEN** l'appréciation « Très bien » est attribuée

#### Scenario: Moyenne intermédiaire
- **WHEN** une moyenne de 13 est calculée
- **THEN** l'appréciation « Assez bien » est attribuée

#### Scenario: Moyenne insuffisante
- **WHEN** une moyenne de 9,9 est calculée
- **THEN** l'appréciation « Insuffisant » est attribuée
