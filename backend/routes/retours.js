const express = require('express');
const router = express.Router();
const retourController = require('../controllers/retourController');

// PROCESSUS RETOUR
router.post('/', retourController.initierRetour); // Initier retour
router.post('/complet', retourController.traiterRetourComplet); // Processus complet (démo)
router.put('/:id/valider', retourController.validerRetour);
router.put('/:id/receptionner', retourController.receptionnerRetour);
router.post('/:id/avoir', retourController.creerAvoirRetour); // Créer avoir
router.put('/:id/rejeter', retourController.rejeterRetour);

// GET
router.get('/', retourController.getAllRetours); // Liste retours
router.get('/:id', retourController.getRetourById); // Détail retour
router.get('/ligne-facture/:ligneFactureId', retourController.getRetoursByLigneFacture);

module.exports = router;