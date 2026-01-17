const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');

router.post('/', factureController.createFacture);
router.put('/:id/valider', factureController.validerFacture);
router.get('/', factureController.getAllFactures);
router.get('/:id', factureController.getFactureById);
router.get('/:id/statut', factureController.checkFactureStatus);
// Route pour annuler une facture
router.put('/:id/annuler', factureController.annulerFacture);
router.get('/:id/retours', factureController.getFactureRetours);

module.exports = router;