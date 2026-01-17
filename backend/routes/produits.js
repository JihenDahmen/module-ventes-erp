const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');

// AJOUTEZ CES ROUTES
router.post('/', produitController.createProduit);        // Créer produit
router.put('/:id', produitController.updateProduit);      // Modifier produit
router.delete('/:id', produitController.deleteProduit);   // Supprimer produit

// ROUTES EXISTANTES
router.get('/', produitController.getAllProduits);
router.get('/:id', produitController.getProduitById);
router.put('/:id/stock', produitController.updateStock);

module.exports = router;