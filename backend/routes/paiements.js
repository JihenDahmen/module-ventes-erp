const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');

// PROCESSUS PAIEMENT
router.post('/', paiementController.enregistrerPaiement); // Enregistrer paiement
router.get('/', paiementController.getAllPaiements); // Liste paiements
router.get('/facture/:factureId', paiementController.getPaiementsFacture); // Paiements d'une facture
router.post('/association-manuelle', paiementController.associerManuellement); // Association manuelle
router.post('/recalculer-soldes', paiementController.recalculerSoldsClients);
router.put('/:id/annuler', paiementController.annulerPaiement);
module.exports = router;