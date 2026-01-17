const Paiement = require('../models/Paiement');
const Facture = require('../models/Facture');
const notificationService = require('../services/notificationService');
const db = require('../config/db');

exports.enregistrerPaiement = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { facture_id, montant, mode_paiement, notes } = req.body;
    
    console.log('=== ENREGISTREMENT PAIEMENT ===');
    console.log('Données reçues:', req.body);
    
    await connection.beginTransaction();
    
    // Validation
    if (!facture_id || !montant || !mode_paiement) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        details: 'facture_id, montant et mode_paiement sont requis'
      });
    }
    
    // Vérifier la facture
    const [factureRows] = await connection.execute(
      `SELECT f.*, c.id as client_id, c.nom as client_nom, c.email as client_email 
       FROM factures f 
       JOIN clients c ON f.client_id = c.id 
       WHERE f.id = ?`,
      [facture_id]
    );
    
    if (factureRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Facture non trouvée',
        needsManualIntervention: true
      });
    }
    
    const facture = factureRows[0];
    console.log('Facture trouvée:', facture.numero, 'Client:', facture.client_nom);
    
    // Vérifier si la facture est payable
    if (facture.statut !== 'validée' && facture.statut !== 'partiellement_payée') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Facture non payable',
        needsValidation: true,
        currentStatus: facture.statut,
        message: 'La facture doit être validée avant paiement'
      });
    }
    
    // Vérifier que le montant est positif
    if (parseFloat(montant) <= 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Montant invalide',
        message: 'Le montant doit être supérieur à 0'
      });
    }
    
    // Calculer le reste à payer
    const [paiementsExistants] = await connection.execute(
      'SELECT COALESCE(SUM(montant), 0) as total_paye FROM paiements WHERE facture_id = ? AND statut = "reçu"',
      [facture_id]
    );
    
    const totalDejaPaye = parseFloat(paiementsExistants[0]?.total_paye) || 0;
    const resteAPayer = parseFloat(facture.montant_ttc) - totalDejaPaye;
    
    if (parseFloat(montant) > resteAPayer) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Montant trop élevé',
        details: {
          montantPropose: montant,
          resteAPayer: resteAPayer,
          montantFacture: facture.montant_ttc,
          dejaPaye: totalDejaPaye
        },
        message: 'Le montant du paiement ne peut pas dépasser le reste à payer'
      });
    }
    
    // 1. Enregistrer le paiement
    const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const date_paiement = new Date().toISOString().split('T')[0];
    
    const [paiementResult] = await connection.execute(
      `INSERT INTO paiements
       (reference, facture_id, montant, mode_paiement, date_paiement, notes, statut)
       VALUES (?, ?, ?, ?, ?, ?, 'reçu')`,
      [reference, facture_id, parseFloat(montant), mode_paiement, date_paiement, notes || null]
    );
    
    const paiementId = paiementResult.insertId;
    
    // 2. Mettre à jour le statut de la facture
    const nouveauTotalPaye = totalDejaPaye + parseFloat(montant);
    let nouveauStatutFacture = 'validée';
    
    if (nouveauTotalPaye >= parseFloat(facture.montant_ttc)) {
      nouveauStatutFacture = 'payée';
    } else if (nouveauTotalPaye > 0) {
      nouveauStatutFacture = 'partiellement_payée';
    }
    
    await connection.execute(
      'UPDATE factures SET statut = ? WHERE id = ?',
      [nouveauStatutFacture, facture_id]
    );
    
    // 3. CORRECTION IMPORTANTE : Mettre à jour le solde du client
    // Le client rembourse sa dette : solde = solde - montant_paiement
    const [clientRows] = await connection.execute(
      'SELECT id, solde FROM clients WHERE id = ?',
      [facture.client_id]
    );
    
    if (clientRows.length > 0) {
      const client = clientRows[0];
      const ancienSolde = parseFloat(client.solde) || 0;
      const nouveauSolde = ancienSolde - parseFloat(montant); // DIMINUTION de la dette
      
      console.log(`Mise à jour solde client ${client.id} (${facture.client_nom}):`);
      console.log(`- Ancien solde: ${ancienSolde}€ (${ancienSolde > 0 ? 'Débiteur' : ancienSolde < 0 ? 'Créditeur' : 'À jour'})`);
      console.log(`- Montant paiement: -${montant}€`);
      console.log(`- Nouveau solde: ${nouveauSolde}€ (${nouveauSolde > 0 ? 'Débiteur' : nouveauSolde < 0 ? 'Créditeur' : 'À jour'})`);
      
      await connection.execute(
        'UPDATE clients SET solde = ? WHERE id = ?',
        [nouveauSolde, client.id]
      );
    }
    
    await connection.commit();
    
    // 4. Notifications
    try {
      await notificationService.notifierComptabilitePaiement({
        reference,
        facture_numero: facture.numero,
        client_nom: facture.client_nom,
        montant: parseFloat(montant),
        mode_paiement
      });
    } catch (notifError) {
      console.warn('Notifications échouées:', notifError.message);
    }
    
    // Réponse
    res.status(201).json({
      success: true,
      message: 'Paiement enregistré avec succès',
      paiement: {
        id: paiementId,
        reference,
        montant: parseFloat(montant),
        mode_paiement,
        date_paiement
      },
      facture: {
        id: facture.id,
        numero: facture.numero,
        nouveauStatut: nouveauStatutFacture,
        montant_ttc: facture.montant_ttc,
        total_paye: nouveauTotalPaye,
        reste_a_payer: parseFloat(facture.montant_ttc) - nouveauTotalPaye
      },
      balanceUpdated: true
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Erreur enregistrement paiement:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

exports.getPaiementsFacture = async (req, res) => {
  try {
    const paiements = await Paiement.findByFacture(req.params.factureId);
    res.json({
      success: true,
      count: paiements.length,
      paiements
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.getAllPaiements = async (req, res) => {
  try {
    const paiements = await Paiement.findAll();
    res.json({
      success: true,
      count: paiements.length,
      paiements
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.associerManuellement = async (req, res) => {
  try {
    const { paiement_id, facture_id } = req.body;
    
    if (!paiement_id || !facture_id) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        details: 'paiement_id et facture_id sont requis'
      });
    }
    
    // Logique d'association manuelle
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // 1. Vérifier que le paiement existe
      const [paiementRows] = await connection.execute(
        'SELECT * FROM paiements WHERE id = ?',
        [paiement_id]
      );
      
      if (paiementRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Paiement non trouvé'
        });
      }
      
      const paiement = paiementRows[0];
      
      // 2. Vérifier que la facture existe
      const [factureRows] = await connection.execute(
        'SELECT * FROM factures WHERE id = ?',
        [facture_id]
      );
      
      if (factureRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Facture non trouvée'
        });
      }
      
      const facture = factureRows[0];
      
      // 3. Associer le paiement à la facture
      await connection.execute(
        'UPDATE paiements SET facture_id = ? WHERE id = ?',
        [facture_id, paiement_id]
      );
      
      // 4. Mettre à jour le statut de la facture
      const [totalPaiements] = await connection.execute(
        'SELECT SUM(montant) as total FROM paiements WHERE facture_id = ? AND statut = "reçu"',
        [facture_id]
      );
      
      const totalPaye = parseFloat(totalPaiements[0]?.total) || 0;
      let nouveauStatut = facture.statut;
      
      if (totalPaye >= facture.montant_ttc) {
        nouveauStatut = 'payée';
      } else if (totalPaye > 0) {
        nouveauStatut = 'partiellement_payée';
      }
      
      await connection.execute(
        'UPDATE factures SET statut = ? WHERE id = ?',
        [nouveauStatut, facture_id]
      );
      
      // 5. Mettre à jour le solde du client
      const [clientRows] = await connection.execute(
        'SELECT id, solde FROM clients WHERE id = ?',
        [facture.client_id]
      );
      
      if (clientRows.length > 0) {
        const client = clientRows[0];
        const ancienSolde = parseFloat(client.solde) || 0;
        const nouveauSolde = ancienSolde - parseFloat(paiement.montant);
        
        await connection.execute(
          'UPDATE clients SET solde = ? WHERE id = ?',
          [nouveauSolde, client.id]
        );
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Association manuelle effectuée',
        paiement: {
          id: paiement_id,
          reference: paiement.reference,
          montant: paiement.montant
        },
        facture: {
          id: facture_id,
          numero: facture.numero,
          nouveauStatut
        },
        balanceUpdated: true,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Erreur association manuelle:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// NOUVELLE MÉTHODE : Recalculer tous les soldes clients
exports.recalculerSoldsClients = async (req, res) => {
  try {
    console.log('=== RECALCUL DES SOLDES CLIENTS ===');
    
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Récupérer tous les clients
      const [clients] = await connection.execute('SELECT id, nom, solde FROM clients');
      const resultats = [];
      
      for (const client of clients) {
        console.log(`\nTraitement client: ${client.nom} (ID: ${client.id})`);
        
        // Calculer le total des factures
        const [facturesResult] = await connection.execute(
          'SELECT COALESCE(SUM(montant_ttc), 0) as total_factures FROM factures WHERE client_id = ?',
          [client.id]
        );
        const totalFactures = parseFloat(facturesResult[0]?.total_factures) || 0;
        
        // Calculer le total des paiements
        const [paiementsResult] = await connection.execute(
          `SELECT COALESCE(SUM(p.montant), 0) as total_paiements 
           FROM paiements p 
           JOIN factures f ON p.facture_id = f.id 
           WHERE f.client_id = ? AND p.statut = "reçu"`,
          [client.id]
        );
        const totalPaiements = parseFloat(paiementsResult[0]?.total_paiements) || 0;
        
        // Calculer le total des avoirs
        const [avoirsResult] = await connection.execute(
          'SELECT COALESCE(SUM(montant), 0) as total_avoirs FROM avoirs WHERE client_id = ? AND statut = "généré"',
          [client.id]
        );
        const totalAvoirs = parseFloat(avoirsResult[0]?.total_avoirs) || 0;
        
        // Calculer le solde correct
        const nouveauSolde = totalFactures - totalPaiements - totalAvoirs;
        const ancienSolde = parseFloat(client.solde) || 0;
        
        console.log(`- Ancien solde: ${ancienSolde}`);
        console.log(`- Total factures: ${totalFactures}`);
        console.log(`- Total paiements: ${totalPaiements}`);
        console.log(`- Total avoirs: ${totalAvoirs}`);
        console.log(`- Nouveau solde calculé: ${nouveauSolde}`);
        
        // Mettre à jour le solde
        await connection.execute(
          'UPDATE clients SET solde = ? WHERE id = ?',
          [nouveauSolde, client.id]
        );
        
        resultats.push({
          clientId: client.id,
          nom: client.nom,
          ancienSolde,
          nouveauSolde,
          difference: nouveauSolde - ancienSolde,
          details: {
            totalFactures,
            totalPaiements,
            totalAvoirs
          }
        });
      }
      
      await connection.commit();
      
      // Afficher le résumé
      console.log('\n=== RÉSUMÉ ===');
      resultats.forEach(r => {
        console.log(`${r.nom}: ${r.ancienSolde} → ${r.nouveauSolde} (diff: ${r.difference})`);
      });
      
      res.json({
        success: true,
        message: 'Soldes clients recalculés avec succès',
        totalClients: clients.length,
        corrections: resultats.filter(r => Math.abs(r.difference) > 0.01).length,
        resultats
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('❌ Erreur recalcul soldes:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Échec du recalcul des soldes'
    });
  }
};
// Ajouter cette méthode
exports.annulerPaiement = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Tentative d'annulation du paiement ID: ${id}`);
    
    // Récupérer le paiement
    const [paiements] = await db.execute(
      'SELECT * FROM paiements WHERE id = ?',
      [id]
    );
    
    if (paiements.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Paiement non trouvé'
      });
    }
    
    const paiement = paiements[0];
    
    // Vérifier si le paiement peut être annulé
    if (paiement.statut !== 'reçu') {
      return res.status(400).json({
        success: false,
        error: 'Seuls les paiements "reçu" peuvent être annulés'
      });
    }
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 1. Marquer le paiement comme annulé
      await connection.execute(
        'UPDATE paiements SET statut = "annulé" WHERE id = ?',
        [id]
      );
      
      // 2. Récupérer la facture associée
      const [factures] = await connection.execute(
        'SELECT * FROM factures WHERE id = ?',
        [paiement.facture_id]
      );
      
      if (factures.length > 0) {
        const facture = factures[0];
        
        // 3. Recalculer le total payé pour cette facture
        const [paiementsFacture] = await connection.execute(
          `SELECT SUM(montant) as total_paye 
           FROM paiements 
           WHERE facture_id = ? AND statut = 'reçu'`,
          [paiement.facture_id]
        );
        
        const totalPaye = paiementsFacture[0].total_paye || 0;
        
        // 4. Mettre à jour le statut de la facture
        let nouveauStatut = 'validée';
        
        if (totalPaye >= facture.montant_ttc) {
          nouveauStatut = 'payée';
        } else if (totalPaye > 0) {
          nouveauStatut = 'partiellement_payée';
        } else if (totalPaye === 0) {
          nouveauStatut = 'validée';
        }
        
        await connection.execute(
          'UPDATE factures SET statut = ? WHERE id = ?',
          [nouveauStatut, paiement.facture_id]
        );
        
        // 5. Mettre à jour le solde du client
        await connection.execute(
          `UPDATE clients c
           JOIN factures f ON c.id = f.client_id
           SET c.solde = c.solde + ?
           WHERE f.id = ?`,
          [paiement.montant, paiement.facture_id]
        );
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Paiement annulé avec succès',
        paiementId: id,
        statut: 'annulé'
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Erreur annulation paiement:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Erreur lors de l\'annulation du paiement'
    });
  }
};