const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/quotes.controller');

// CRUD devis
router.post('/', ctrl.createQuote);
router.get('/', ctrl.getAllQuotes);
router.get('/:id', ctrl.getQuoteById);

// Update statut
router.put('/:id/status', ctrl.updateQuoteStatus);

// Convertir devis -> commande
router.post('/:id/convert-to-order', ctrl.convertQuoteToOrder);

module.exports = router;
