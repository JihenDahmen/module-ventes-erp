# Sales Reporting Backend

Backend Node.js/Express pour le module de reporting des ventes de l'ERP.

## Prérequis

- Node.js
- MySQL

## Installation

1.  Installer les dépendances :
    ```bash
    npm install
    ```

2.  Configurer la base de données :
    - Renommer `.env.example` en `.env` (si applicable) ou utiliser le fichier `.env` généré.
    - Assurez-vous que les identifiants de base de données dans `.env` sont corrects.

3.  Lancer le serveur :
    ```bash
    npm run dev
    ```

## API Endpoints

- `GET /api/report/total-revenue` : Chiffre d'affaires global.
- `GET /api/report/sales-by-product` : Ventes par produit.
- `GET /api/report/sales-by-client` : Ventes par client.
- `GET /api/report/sales-by-region` : Ventes par région.
- `GET /api/report/conversion-rate` : Taux de transformation (Devis -> Commandes).
- `GET /api/report/pending-payments` : Paiements en attente.

## Structure

- `src/app.js` : Point d'entrée.
- `src/config/db.js` : Connexion BDD.
- `src/controllers/` : Logique métier et requêtes SQL.
- `src/routes/` : Définition des routes API.
