const Facture = require('../models/Facture');
const db = require('../config/db'); // AJOUT IMPORTANT

exports.createFacture = async (req, res) => {
  try {
    const { client_id, lignes } = req.body;

    if (!client_id || !lignes || lignes.length === 0) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: 'client_id et lignes sont requis'
      });
    }

    const result = await Facture.create(req.body);
    
    // IMPORTANT: Mettre à jour le solde du client
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Récupérer le montant de la facture créée
      const [factureRows] = await connection.execute(
        'SELECT montant_ttc FROM factures WHERE id = ?',
        [result.id]
      );
      
      if (factureRows.length > 0) {
        const montantFacture = parseFloat(factureRows[0].montant_ttc) || 0;
        
        // Augmenter le solde du client (il nous doit plus d'argent)
        await connection.execute(
          'UPDATE clients SET solde = solde + ? WHERE id = ?',
          [montantFacture, client_id]
        );
        
        console.log(`✅ Facture ${result.numero}: Client ${client_id} +${montantFacture}€`);
      }
      
      await connection.commit();
      
    } catch (error) {
      await connection.rollback();
      console.error('Erreur mise à jour solde:', error);
      // On continue quand même
    } finally {
      connection.release();
    }

    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      facture: {
        id: result.id,
        numero: result.numero,
        statut: 'brouillon'
      },
      nextAction: 'validation'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.validerFacture = async (req, res) => {
  try {
    const { id } = req.params;

    const success = await Facture.valider(id);

    if (!success) {
      return res.status(400).json({
        error: 'Validation impossible',
        possibleReasons: [
          'Facture déjà validée',
          'Statut incorrect',
          'Facture non trouvée'
        ]
      });
    }

    res.json({
      success: true,
      message: 'Facture validée avec succès',
      factureId: id,
      newStatus: 'validée',
      canBePaid: true
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllFactures = async (req, res) => {
  try {
    const factures = await Facture.findAll();

    // Statistiques
    const stats = {
      total: factures.length,
      brouillon: factures.filter(f => f.statut === 'brouillon').length,
      validée: factures.filter(f => f.statut === 'validée').length,
      payée: factures.filter(f => f.statut === 'payée').length,
      partiellement_payée: factures.filter(f => f.statut === 'partiellement_payée').length,
      annulée: factures.filter(f => f.statut === 'annulée').length
    };

    // Total montants - CORRECTION ICI
    // Assurez-vous de convertir en nombre et de sommer correctement
    const totalMontant = factures.reduce((sum, f) => {
      // Convertir montant_ttc en nombre (certains peuvent être des strings)
      const montant = parseFloat(f.montant_ttc) || 0;
      return sum + montant;
    }, 0);

    res.json({
      success: true,
      stats,
      totalMontant: totalMontant.toFixed(2), // Format avec 2 décimales
      count: factures.length,
      factures
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFactureById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`API getFactureById appelée avec ID: ${id}`);
    
    const facture = await Facture.findById(id);

    if (!facture) {
      console.log(`Facture ${id} non trouvée dans la base`);
      return res.status(404).json({
        success: false,
        error: 'Facture non trouvée',
        requestedId: id
      });
    }

    console.log(`Facture ${id} trouvée: ${facture.numero}`);
    res.json({
      success: true,
      facture
    });

  } catch (error) {
    console.error('Erreur getFactureById:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.checkFactureStatus = async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);

    if (!facture) {
      return res.status(404).json({
        success: false,
        error: 'Facture non trouvée'
      });
    }

    const peutEtrePayee = await Facture.peutEtrePayee(facture.id);

    res.json({
      success: true,
      facture: {
        id: facture.id,
        numero: facture.numero,
        statut: facture.statut,
        montant_ttc: facture.montant_ttc,
        client: facture.client_nom,
        email: facture.client_email
      },
      paiement: {
        possible: peutEtrePayee,
        totalPaye: facture.total_paye || 0,
        resteAPayer: facture.montant_ttc - (facture.total_paye || 0)
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.annulerFacture = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Tentative d'annulation facture ID: ${id}`);
    
    // Vérifier que la facture existe
    const [factures] = await db.execute(
      'SELECT * FROM factures WHERE id = ?',
      [id]
    );
    
    if (factures.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Facture non trouvée'
      });
    }
    
    const facture = factures[0];
    
    // Vérifier si la facture peut être annulée
    if (facture.statut === 'annulée') {
      return res.status(400).json({
        success: false,
        error: 'Cette facture est déjà annulée'
      });
    }
    
    if (facture.statut === 'payée') {
      return res.status(400).json({
        success: false,
        error: 'Les factures payées ne peuvent pas être annulées'
      });
    }
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 1. Marquer la facture comme annulée
      await connection.execute(
        'UPDATE factures SET statut = "annulée" WHERE id = ?',
        [id]
      );
      
      // 2. Rembourser les stocks des produits
      const [lignes] = await connection.execute(
        'SELECT * FROM lignes_facture WHERE facture_id = ?',
        [id]
      );
      
      for (const ligne of lignes) {
        await connection.execute(
          'UPDATE produits SET stock = stock + ? WHERE id = ?',
          [ligne.quantite, ligne.produit_id]
        );
      }
      
      // 3. Annuler les paiements associés
      const [paiements] = await connection.execute(
        'SELECT * FROM paiements WHERE facture_id = ? AND statut = "reçu"',
        [id]
      );
      
      for (const paiement of paiements) {
        // Annuler le paiement
        await connection.execute(
          'UPDATE paiements SET statut = "annulé" WHERE id = ?',
          [paiement.id]
        );
        
        // Ajuster le solde du client (remboursement)
        await connection.execute(
          `UPDATE clients c
           JOIN factures f ON c.id = f.client_id
           SET c.solde = c.solde + ?
           WHERE f.id = ?`,
          [paiement.montant, id]
        );
      }
      
      // 4. Si aucun paiement n'a été effectué, ajuster quand même le solde
      if (paiements.length === 0 && facture.statut === 'validée') {
        // Pour les factures validées mais non payées, ajuster le solde
        await connection.execute(
          `UPDATE clients c
           JOIN factures f ON c.id = f.client_id
           SET c.solde = c.solde - ?
           WHERE f.id = ?`,
          [facture.montant_ttc, id]
        );
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Facture annulée avec succès',
        factureId: id,
        statut: 'annulée',
        actions: {
          stock_reapprovisionne: lignes.length,
          paiements_annules: paiements.length
        }
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Erreur annulation facture:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: 'Erreur lors de l\'annulation de la facture'
    });
  }
};
exports.getFactureRetours = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [retours] = await db.execute(`
      SELECT r.id, r.reference, r.statut 
      FROM retours r 
      WHERE r.facture_id = ? 
        AND r.statut NOT IN ('clôturé', 'rejeté')
    `, [id]);
    
    res.json({
      success: true,
      factureId: id,
      retoursActifs: retours,
      count: retours.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};