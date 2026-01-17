const Produit = require('../models/Produit');
// Ajoutez cette méthode au controller existant
exports.createProduit = async (req, res) => {
  try {
    const { reference, nom, description, prix_ht, tva = 20, stock = 0 } = req.body;

    // Validation
    if (!reference || !nom || !prix_ht) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: 'reference, nom et prix_ht sont requis'
      });
    }

    // Vérifier si la référence existe déjà
    const db = require('../config/db');
    const [existing] = await db.execute(
      'SELECT id FROM produits WHERE reference = ?',
      [reference]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Référence déjà utilisée',
        details: 'Cette référence de produit existe déjà'
      });
    }

    // Créer le produit
    const [result] = await db.execute(
      `INSERT INTO produits 
       (reference, nom, description, prix_ht, tva, stock, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [reference, nom, description || null, prix_ht, tva, stock]
    );

    // Récupérer le produit créé
    const [produit] = await db.execute(
      'SELECT * FROM produits WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      produit: produit[0]
    });

  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
};

// Ajoutez aussi la méthode updateProduit
exports.updateProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const { reference, nom, description, prix_ht, tva, stock } = req.body;

    // Vérifier si le produit existe
    const db = require('../config/db');
    const [existing] = await db.execute(
      'SELECT id FROM produits WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      });
    }

    // Mettre à jour
    await db.execute(
      `UPDATE produits 
       SET reference = ?, nom = ?, description = ?, prix_ht = ?, tva = ?, stock = ?
       WHERE id = ?`,
      [reference, nom, description || null, prix_ht, tva || 20, stock || 0, id]
    );

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour produit:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
  }
};

// Ajoutez aussi la méthode deleteProduit
exports.deleteProduit = async (req, res) => {
  try {
    const { id } = req.params;

    const db = require('../config/db');
    
    // Vérifier si le produit existe
    const [existing] = await db.execute(
      'SELECT id FROM produits WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      });
    }

    // Vérifier si le produit est utilisé dans des factures
    const [usedInFactures] = await db.execute(
      'SELECT COUNT(*) as count FROM lignes_facture WHERE produit_id = ?',
      [id]
    );

    if (usedInFactures[0].count > 0) {
      return res.status(400).json({
        error: 'Produit utilisé dans des factures',
        details: 'Impossible de supprimer un produit déjà utilisé'
      });
    }

    // Supprimer
    await db.execute(
      'DELETE FROM produits WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
  }
};
exports.getAllProduits = async (req, res) => {
  try {
    const produits = await Produit.findAll();

    // Analyse du stock
    const analyseStock = {
      totalProduits: produits.length,
      totalEnStock: produits.reduce((sum, p) => sum + p.stock, 0),
      valeurStock: produits.reduce((sum, p) => sum + (p.prix_ht * p.stock), 0),
      produitsFaibleStock: produits.filter(p => p.stock < 10).length,
      produitsStockMoyen: produits.filter(p => p.stock >= 10 && p.stock < 50).length,
      produitsBonStock: produits.filter(p => p.stock >= 50).length
    };

    res.json({
      success: true,
      analyse: analyseStock,
      count: produits.length,
      produits
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    // Calculer prix TTC
    const prixTTC = produit.prix_ht * (1 + produit.tva / 100);

    // Niveau de stock
    let niveauStock = 'bon';
    if (produit.stock < 10) niveauStock = 'faible';
    else if (produit.stock < 50) niveauStock = 'moyen';

    res.json({
      success: true,
      produit: {
        ...produit,
        prix_ttc: prixTTC.toFixed(2),
        niveau_stock: niveauStock,
        valeur_stock: (produit.prix_ht * produit.stock).toFixed(2)
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantite } = req.body;

    if (quantite === undefined) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: 'La quantité est requise'
      });
    }

    const produit = await Produit.findById(id);
    if (!produit) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    const success = await Produit.updateStock(id, parseInt(quantite));

    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Échec de la mise à jour du stock'
      });
    }

    // Récupérer le produit mis à jour
    const produitMisAJour = await Produit.findById(id);

    res.json({
      success: true,
      message: 'Stock mis à jour avec succès',
      produit: {
        id: produitMisAJour.id,
        nom: produitMisAJour.nom,
        stock_avant: produit.stock,
        stock_apres: produitMisAJour.stock,
        variation: parseInt(quantite)
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};