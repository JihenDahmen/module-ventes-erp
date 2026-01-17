const db = require('../config/db');

class WorkflowService {
  // PROCESSUS PAIEMENT - Étape 1: Vérifier la facture
  async verifierFacture(factureId) {
    const [facture] = await db.execute(
      'SELECT * FROM factures WHERE id = ?',
      [factureId]
    );
    
    if (facture.length === 0) {
      throw new Error('Facture non trouvée');
    }
    
    if (facture[0].statut !== 'validée') {
      throw new Error('Facture non validée. Demande de validation nécessaire.');
    }
    
    return facture[0];
  }

  // PROCESSUS PAIEMENT - Étape 2: Associer paiement à facture
  async associerPaiementFacture(paiementId, factureId) {
    try {
      // Vérifier que la facture existe et est valide
      const facture = await this.verifierFacture(factureId);
      
      // Associer le paiement
      const [result] = await db.execute(
        'UPDATE paiements SET facture_id = ? WHERE id = ?',
        [factureId, paiementId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Paiement non trouvé');
      }
      
      return {
        success: true,
        message: 'Paiement associé avec succès',
        facture
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        needsManualIntervention: true
      };
    }
  }

  // PROCESSUS PAIEMENT - Étape 3: Mettre à jour balance client
  async mettreAJourBalanceClient(factureId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Récupérer le total payé pour cette facture
      const [paiements] = await connection.execute(
        `SELECT SUM(montant) as total_paye 
         FROM paiements 
         WHERE facture_id = ? AND statut = 'reçu'`,
        [factureId]
      );
      
      const totalPaye = paiements[0].total_paye || 0;
      
      // Récupérer client et montant facture
      const [facture] = await connection.execute(
        `SELECT f.montant_ttc, f.client_id, c.solde 
         FROM factures f 
         JOIN clients c ON f.client_id = c.id 
         WHERE f.id = ?`,
        [factureId]
      );
      
      if (facture.length === 0) {
        throw new Error('Facture non trouvée');
      }
      
      const { montant_ttc, client_id, solde } = facture[0];
      
      // Calculer nouvelle balance
      const nouveauSolde = solde - totalPaye;
      
      // Mettre à jour la balance
      await connection.execute(
        'UPDATE clients SET solde = ? WHERE id = ?',
        [nouveauSolde, client_id]
      );
      
      // Mettre à jour statut facture
      let statutFacture = 'validée';
      if (totalPaye >= montant_ttc) {
        statutFacture = 'payée';
      } else if (totalPaye > 0) {
        statutFacture = 'partiellement_payée';
      }
      
      await connection.execute(
        'UPDATE factures SET statut = ? WHERE id = ?',
        [statutFacture, factureId]
      );
      
      await connection.commit();
      
      return {
        success: true,
        nouveauSolde,
        balanceMiseAJour: nouveauSolde === 0,
        statutFacture
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // PROCESSUS RETOUR - Étape 1: Vérifier et valider retour
  async verifierEtValiderRetour(retourId) {
    const [retour] = await db.execute(
      `SELECT r.*, f.numero as facture_numero, c.nom as client_nom 
       FROM retours r
       JOIN factures f ON r.facture_id = f.id
       JOIN clients c ON r.client_id = c.id
       WHERE r.id = ?`,
      [retourId]
    );
    
    if (retour.length === 0) {
      throw new Error('Retour non trouvé');
    }
    
    if (retour[0].statut !== 'demandé') {
      throw new Error(`Retour déjà traité (statut: ${retour[0].statut})`);
    }
    
    // Validation SAV (simulée)
    const validationSAV = Math.random() > 0.1; // 90% de validation
    
    if (!validationSAV) {
      await db.execute(
        'UPDATE retours SET statut = "rejeté" WHERE id = ?',
        [retourId]
      );
      throw new Error('Retour rejeté par le SAV');
    }
    
    // Valider le retour
    await db.execute(
      'UPDATE retours SET statut = "validé" WHERE id = ?',
      [retourId]
    );
    
    return retour[0];
  }

  // PROCESSUS RETOUR - Étape 2: Mettre à jour stock après réception
  async mettreAJourStockRetour(retourId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Récupérer les lignes de retour
      const [lignes] = await connection.execute(
        `SELECT lr.*, p.nom as produit_nom 
         FROM lignes_retour lr
         JOIN produits p ON lr.produit_id = p.id
         WHERE lr.retour_id = ?`,
        [retourId]
      );
      
      // Mettre à jour le stock pour chaque produit
      for (const ligne of lignes) {
        await connection.execute(
          'UPDATE produits SET stock = stock + ? WHERE id = ?',
          [ligne.quantite_retournee, ligne.produit_id]
        );
      }
      
      // Marquer comme réceptionné
      await connection.execute(
        'UPDATE retours SET statut = "réceptionné" WHERE id = ?',
        [retourId]
      );
      
      await connection.commit();
      
      return {
        success: true,
        produitsMisAJour: lignes.length,
        message: 'Stock mis à jour et retour réceptionné'
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // PROCESSUS RETOUR - Étape 3: Créer avoir/remboursement
  async creerAvoirRetour(retourId, type = 'avoir_client') {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Récupérer le retour avec les lignes
      const [retour] = await connection.execute(
        `SELECT r.*, f.montant_ttc as montant_facture, c.id as client_id, c.nom as client_nom
         FROM retours r
         JOIN factures f ON r.facture_id = f.id
         JOIN clients c ON r.client_id = c.id
         WHERE r.id = ?`,
        [retourId]
      );
      
      if (retour.length === 0) {
        throw new Error('Retour non trouvé');
      }
      
      // Calculer le montant de l'avoir (pour simplifier: 100% du montant de la facture)
      // En réalité, on devrait calculer basé sur les lignes retournées
      const montantAvoir = retour[0].montant_facture * 0.8; // 80% du montant pour exemple
      
      // Générer numéro d'avoir
      const numeroAvoir = `AVOIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Créer l'avoir
      const [avoirResult] = await connection.execute(
        `INSERT INTO avoirs 
         (numero, retour_id, client_id, montant, type, date_avoir, statut) 
         VALUES (?, ?, ?, ?, ?, CURDATE(), 'généré')`,
        [numeroAvoir, retourId, retour[0].client_id, montantAvoir, type]
      );
      
      // Si c'est un avoir client, créditer son compte
      if (type === 'avoir_client') {
        await connection.execute(
          'UPDATE clients SET solde = solde - ? WHERE id = ?',
          [montantAvoir, retour[0].client_id]
        );
      }
      
      // Clôturer le retour
      await connection.execute(
        'UPDATE retours SET statut = "clôturé" WHERE id = ?',
        [retourId]
      );
      
      await connection.commit();
      
      return {
        success: true,
        avoirId: avoirResult.insertId,
        numeroAvoir,
        montant: montantAvoir,
        type,
        client: retour[0].client_nom
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new WorkflowService();