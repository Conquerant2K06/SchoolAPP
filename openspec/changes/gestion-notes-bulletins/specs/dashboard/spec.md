# Spec Delta

## Purpose

Offrir une vue statistique de l'établissement par classe et par trimestre : moyennes de classe, taux de réussite, top 10 des élèves et répartition des mentions.

## ADDED Requirements

### Requirement: Accès au tableau de bord selon le rôle
Le système SHALL donner à l'administrateur accès au tableau de bord complet de l'établissement, restreindre l'enseignant aux classes qui lui sont affectées, et refuser l'accès à l'élève.

#### Scenario: Accès administrateur
- **WHEN** un administrateur ouvre le tableau de bord
- **THEN** il voit les statistiques de toutes les classes de l'année et du trimestre sélectionnés

#### Scenario: Accès enseignant restreint
- **WHEN** un enseignant ouvre le tableau de bord
- **THEN** seules les classes lui étant affectées figurent dans les statistiques

#### Scenario: Accès élève refusé
- **WHEN** un élève tente d'ouvrir le tableau de bord
- **THEN** le système refuse l'accès (403)

### Requirement: Moyennes par classe
Le système SHALL afficher, pour chaque classe du périmètre et le trimestre sélectionné, la moyenne des moyennes générales des élèves et l'effectif d'élèves considérés.

#### Scenario: Statistiques par classe
- **WHEN** un trimestre est sélectionné
- **THEN** chaque classe affiche sa moyenne de classe et son effectif d'élèves ayant au moins une note

#### Scenario: Classe sans aucune note
- **WHEN** une classe ne possède aucune note au trimestre sélectionné
- **THEN** sa moyenne est affichée comme « aucune donnée » avec un effectif de 0 élève noté

### Requirement: Taux de réussite
Le système SHALL calculer le taux de réussite comme le pourcentage d'élèves dont la moyenne générale au trimestre sélectionné est supérieure ou égale à 10.

#### Scenario: Calcul du taux
- **WHEN** 10 élèves ont une moyenne générale au trimestre et 7 sont à 10 ou plus
- **THEN** le taux de réussite affiché est de 70 %

#### Scenario: Aucun élève noté
- **WHEN** aucun élève du périmètre n'a de moyenne générale au trimestre
- **THEN** le taux de réussite est affiché comme « aucune donnée »

### Requirement: Top 10 des élèves
Le système SHALL afficher les 10 élèves les mieux classés du périmètre par moyenne générale décroissante au trimestre sélectionné, avec leur classe et leur moyenne.

#### Scenario: Classement complet
- **WHEN** au moins 10 élèves disposent d'une moyenne générale au trimestre
- **THEN** le tableau affiche exactement les 10 meilleures moyennes, en ordre décroissant

#### Scenario: Moins de 10 élèves éligibles
- **WHEN** moins de 10 élèves du périmètre ont une moyenne générale au trimestre
- **THEN** le tableau liste tous les élèves éligibles disponibles

### Requirement: Répartition des mentions
Le système SHALL compter, pour le trimestre sélectionné, le nombre de moyennes générales correspondant à chacune des cinq mentions du barème (Très bien, Bien, Assez bien, Passable, Insuffisant).

#### Scenario: Comptage par mention
- **WHEN** le trimestre est sélectionné et que les moyennes générales sont connues
- **THEN** les cinq mentions sont affichées avec le nombre d'élèves correspondant pour chacune

### Requirement: Filtres du tableau de bord
Le système SHALL permettre de sélectionner l'année scolaire, le trimestre et, pour l'administrateur, la classe ; tous les indicateurs SHALL être recalculés selon la sélection.

#### Scenario: Filtre classe pour l'administrateur
- **WHEN** l'administrateur sélectionne une classe et un trimestre
- **THEN** moyennes, taux de réussite, top 10 et mentions sont recalculés sur les seuls élèves de cette classe
