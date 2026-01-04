const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.get('/:id/solde', clientController.getClientBalance);
router.get('/:id/can-delete', clientController.checkIfClientCanBeDeleted);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);
router.post('/:id/recalculer-solde', clientController.recalculerSolde);


module.exports = router;