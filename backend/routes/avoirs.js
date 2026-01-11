const express = require('express');
const router = express.Router();
const avoirController = require('../controllers/avoirController');

router.post('/', avoirController.createAvoir);
router.post('/appliquer', avoirController.appliquerAvoir);
router.get('/', avoirController.getAllAvoirs);
router.get('/client/:clientId', avoirController.getAvoirsClient);
router.put('/:id/annuler', avoirController.annulerAvoir);
router.post('/:id/rembourser', avoirController.effectuerRemboursement);
router.post('/:id/echange/processus', avoirController.demarrerProcessusEchange);

module.exports = router;