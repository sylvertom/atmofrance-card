# Home Assistant Atmo France Card

Carte Lovelace personnalisée pour l'intégration Home Assistant [Atmo France](https://github.com/sebcaps/atmofrance). Affiche les données de qualité de l'air (pollution) et de pollen pour les villes françaises dans une carte configurable.

Ce projet est indépendant et n'est en aucun cas lié à l'intégration Home Assistant [Atmo France](https://github.com/sebcaps/atmofrance) ni à Atmo France elle-même.

![AtmoFrance Card](screenshot.png)

## Fonctionnalités

- **Auto-découverte** — aucune configuration manuelle des entités nécessaire ; détecte automatiquement tous les capteurs atmofrance
- **Vue compacte** — deux pastilles colorées indiquant les niveaux globaux de pollution et de pollen
- **Vue détaillée** — grille détaillée avec tous les polluants/pollens individuels, barres de couleur et niveaux
- **Prévisions** — colonne optionnelle de prévision
- **Bilingue** — français et anglais, détecte automatiquement depuis la langue de Home Assistant
- **Éditeur visuel** — configuration complète via l'éditeur de carte HA
- **Affichage conditionnel** — possibilité de masquer les capteurs individuels lorsque leur niveau est bon
- **Concentrations de pollen** — possibilité d'afficher les valeurs de concentration

## Prérequis

L'[intégration Atmo France](https://github.com/sebcaps/atmofrance) doit être installée et configurée via HACS. La carte détecte automatiquement les entités créées par cette intégration.

## Installation

### HACS (recommandé)

1. Ouvrir HACS dans votre instance Home Assistant
2. Cliquer sur le menu trois points > **Dépôts personnalisés**
3. Ajouter `https://github.com/sylvertom/atmofrance-card` avec le type **Dashboard**
4. Rechercher "Atmo France Card" et l'installer
5. Redémarrer Home Assistant

### Manuel

1. Télécharger `atmofrance-card.js` depuis la [dernière version](https://github.com/sylvertom/atmofrance-card/releases)
2. Le copier dans votre répertoire `config/www/`
3. Ajouter la ressource dans **Paramètres > Tableaux de bord > Ressources** :

```yaml
resources:
  - url: /local/atmofrance-card.js
    type: module
```

4. Redémarrer Home Assistant

## Configuration

Ajouter la carte à une vue du tableau de bord :

```yaml
type: custom:atmofrance-card
```

Toute la configuration est optionnelle — la carte fonctionne sans aucune configuration.

### Options

| Option               | Type    | Par défaut    | Description                                          |
|----------------------|---------|---------------|------------------------------------------------------|
| `title`              | string  | `Atmo France` | Titre personnalisé de la carte                       |
| `zone_name`          | string  | _(toutes)_    | Filtrer sur une zone spécifique                      |
| `show_pollution`     | boolean | `true`        | Afficher la section pollution                        |
| `show_pollen`        | boolean | `true`        | Afficher la section pollen                           |
| `show_forecast`      | boolean | `true`        | Afficher la colonne de prévision J+1                 |
| `hide_when_good`     | boolean | `true`        | Masquer les capteurs individuels quand le niveau est bon |
| `show_details`       | boolean | `true`        | Afficher la vue détaillée avec les capteurs individuels |
| `show_concentration` | boolean | `false`       | Afficher les valeurs de concentration de pollen      |

### Exemple

```yaml
type: custom:atmofrance-card
title: "Qualité de l'air"
show_forecast: true
hide_when_good: true
show_details: true
show_concentration: true
```

## Fonctionnement

La carte parcourt `hass.states` à la recherche de capteurs possédant les attributs distinctifs `Couleur` et `Nom de la zone` fournis par l'intégration Atmo France. Elle classe les entités ainsi :

- **Pollution vs Pollen** — par mots-clés dans l'identifiant de l'entité (`dioxyde_d_azote`, `ozone`, `pm10`, etc. vs `niveau_ambroisie`, `niveau_armoise`, etc.)
- **Aujourd'hui vs Prévision** — l'identifiant contient `_j_1` ou le nom convivial contient `J+1`
- **Niveau vs Concentration** — les entités de concentration ont l'unité `µg/m³` ou le préfixe `concentration_`

## Capteurs affichés

### Pollution

| Capteur              | Motif d'entité        |
|----------------------|-----------------------|
| Qualité globale      | `qualite_globale`     |
| NO2                  | `dioxyde_d_azote`     |
| O3                   | `ozone`               |
| PM10                 | `pm10`                |
| PM2.5                | `pm25`                |
| SO2                  | `dioxyde_de_soufre`   |

### Pollen

| Capteur              | Motif d'entité            |
|----------------------|---------------------------|
| Qualité globale      | `qualite_globale_pollen`  |
| Ambroisie            | `niveau_ambroisie`        |
| Armoise              | `niveau_armoise`          |
| Aulne                | `niveau_aulne`            |
| Bouleau              | `niveau_bouleau`          |
| Graminées            | `niveau_gramine`          |
| Olivier              | `niveau_olivier`          |

## Développement

```bash
npm install
npm run build     # compilation unique
npm run watch     # recompilation automatique
```

## Licence

MIT - voir [LICENSE](LICENSE).
