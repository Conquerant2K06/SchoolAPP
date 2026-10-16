# Spec Delta

## Purpose

Produire, publier et diffuser le bulletin scolaire d'un élève pour un trimestre : moyennes par matière, moyenne générale, appréciation, rang dans la classe et document PDF téléchargeable.

## ADDED Requirements

### Requirement: Un bulletin par élève et par trimestre
Le système SHALL garantir l'unicité du bulletin pour un couple (élève, trimestre). La régénération d'un bulletin existant SHALL le mettre à jour sans créer de doublon.

#### Scenario: Régénération sans doublon
- **WHEN** le bulletin d'un élève pour un trimestre est régénéré après de nouvelles saisies de notes
- **THEN** un seul bulletin subsiste pour ce couple et il reflète les notes les plus récentes

### Requirement: Contenu du bulletin
Le système SHALL construire le bulletin à partir des notes du trimestre : moyennes par matière, moyenne générale, appréciation générale selon le barème, rang dans la classe, et identité de l'élève, de la classe, du trimestre et de l'année scolaire.

#### Scenario: Bulletin avec notes
- **WHEN** le bulletin d'un élève ayant des notes au trimestre est généré
- **THEN** il contient chaque matière avec sa moyenne et son coefficient, la moyenne générale, l'appréciation générale et le rang

#### Scenario: Bulletin sans aucune note
- **WHEN** le bulletin d'un élève sans aucune note au trimestre est généré
- **THEN** il est produit avec la mention « aucune note enregistrée » et ne peut pas être publié

### Requirement: Rang dans la classe
Le système SHALL classer les élèves d'une classe par moyenne générale décroissante pour attribuer le rang. Les moyennes égales SHALL recevoir le même rang et les rangs suivants sauteront le nombre d'ex æquo (classement 1, 1, 3).

#### Scenario: Ex æquo en tête de classe
- **WHEN** deux élèves ont la moyenne générale la plus élevée et égale
- **THEN** tous deux sont classés 1er et le suivant est classé 3e

#### Scenario: Classement décroissant
- **WHEN** les moyennes générales de la classe sont toutes différentes
- **THEN** les rangs sont attribués de 1 à N dans l'ordre décroissant des moyennes

### Requirement: Publication d'un bulletin par l'administrateur
Le système SHALL attribuer à chaque bulletin un statut « brouillon » ou « publié ». Seul l'administrateur SHALL pouvoir publier un bulletin, et un bulletin « aucune note enregistrée » SHALL rester impubliable.

#### Scenario: Publication
- **WHEN** un administrateur publie le bulletin d'un élève
- **THEN** le bulletin devient visible par cet élève

#### Scenario: Tentative de publication par un non-administrateur
- **WHEN** un enseignant ou un élève tente de publier un bulletin
- **THEN** le système refuse l'opération (403) et le statut reste inchangé

#### Scenario: Bulletin sans notes
- **WHEN** un administrateur tente de publier un bulletin portant la mention « aucune note enregistrée »
- **THEN** la publication est refusée avec un message explicite

### Requirement: Consultation des bulletins par l'élève
Le système SHALL permettre à un élève de lister et de consulter uniquement ses propres bulletins ayant le statut « publié », organisés par trimestre.

#### Scenario: Liste des bulletins publiés
- **WHEN** un élève connecté ouvre la liste de ses bulletins
- **THEN** seuls ses bulletins publiés sont affichés, par trimestre, avec moyennes, rang et appréciation

#### Scenario: Bulletin non publié
- **WHEN** un élève demande l'accès à l'un de ses bulletins encore en brouillon
- **THEN** le bulletin lui est invisible (liste et accès direct compris)

### Requirement: Génération PDF d'un bulletin
Le système SHALL produire un document PDF téléchargeable reprenant exactement les informations affichées du bulletin, accessible à l'administrateur pour tout bulletin et à l'élève pour ses bulletins publiés.

#### Scenario: Téléchargement par l'administrateur
- **WHEN** un administrateur demande le PDF d'un bulletin
- **THEN** un PDF est généré contenant identité, classe, trimestre, moyennes par matière, moyenne générale, appréciation et rang

#### Scenario: Téléchargement par l'élève
- **WHEN** un élève demande le PDF de l'un de ses bulletins publiés
- **THEN** le PDF est généré ; pour un bulletin non publié, la demande est refusée (403 ou 404)

### Requirement: Recherche et filtres sur les bulletins
Le système SHALL permettre à l'administrateur de filtrer les bulletins par classe, élève, trimestre et statut, et de combiner ces filtres.

#### Scenario: Filtre classe et trimestre
- **WHEN** les filtres classe et trimestre sont sélectionnés ensemble
- **THEN** seuls les bulletins de cette classe pour ce trimestre sont affichés

#### Scenario: Filtre par statut
- **WHEN** le filtre « publié » est sélectionné
- **THEN** seuls les bulletins ayant le statut publié sont affichés
