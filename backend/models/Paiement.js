const db = require('../config/db');

const Paiement = {
  // Générer une référence de paiement
  generateReference: () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PAY-${timestamp}-${random}`;
  },

  // Enregistrer un paiement
enregistrerPaiement: async (paiementData) => {
  const { facture_id, montant, mode_paiement, notes } = paiementData;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
      
      // Générer référence
      const reference = Paiement.generateReference();
      const date_paiement = new Date().toISOString().split('T')[0];
      
      // Enregistrer le paiement
      const [result] = await connection.execute(
        `INSERT INTO paiements
         (reference, facture_id, montant, mode_paiement, date_paiement, notes, statut)
         VALUES (?, ?, ?, ?, ?, ?, 'reçu')`,
        [reference, facture_id, montant, mode_paiement, date_paiement, notes || null]
      );
      
      const paiementId = result.insertId;
      
      // Mettre à jour le statut de la facture
      const [facture] = await connection.execute(
        'SELECT montant_ttc, client_id FROM factures WHERE id = ?',
        [facture_id]
      );
      
        if (facture.length > 0) {
      const montantTotal = facture[0].montant_ttc;
      const clientId = facture[0].client_id;
      
      // Calculer le total payé pour cette facture
      const [paiements] = await connection.execute(
        `SELECT SUM(montant) as total_paye
         FROM paiements
         WHERE facture_id = ? AND statut = 'reçu'`,
        [facture_id]
      );
        
          const totalPaye = (paiements[0].total_paye || 0) + parseFloat(montant);
      let nouveauStatut = 'validée';
      
      if (totalPaye >= montantTotal) {
        nouveauStatut = 'payée';
      } else if (totalPaye > 0) {
        nouveauStatut = 'partiellement_payée';
      }
      
        
         await connection.execute(
        'UPDATE factures SET statut = ? WHERE id = ?',
        [nouveauStatut, facture_id]
      );
      
      // CORRECTION ICI : Un paiement DIMINUE la dette du client
      // Donc on soustrait le montant du solde
      await connection.execute(
        'UPDATE clients SET solde = solde - ? WHERE id = ?',
        [montant, clientId]
      );
    }
      
      await connection.commit();
      
      return {
        id: paiementId,
        reference,
        facture_id,
        montant,
        mode_paiement,
        date_paiement,
        statut: 'reçu',
        notes: notes || null
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Trouver tous les paiements
  findAll: async () => {
    const [rows] = await db.execute(`
      SELECT p.*,
             f.numero as facture_numero,
             c.nom as client_nom,
             c.email as client_email
      FROM paiements p
      JOIN factures f ON p.facture_id = f.id
      JOIN clients c ON f.client_id = c.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  },

  // Trouver les paiements d'une facture
  findByFacture: async (factureId) => {
    const [rows] = await db.execute(
      'SELECT * FROM paiements WHERE facture_id = ? ORDER BY date_paiement DESC',
      [factureId]
    );
    return rows;
  },
  annuler: async (id) => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 1. Récupérer le paiement
      const [paiements] = await connection.execute(
        'SELECT * FROM paiements WHERE id = ?',
        [id]
      );
      
      if (paiements.length === 0) {
        throw new Error('Paiement non trouvé');
      }
      
      const paiement = paiements[0];
      
      // 2. Vérifier qu'il peut être annulé
      if (paiement.statut !== 'reçu') {
        throw new Error('Seuls les paiements "reçu" peuvent être annulés');
      }
      
      // 3. Marquer comme annulé
      await connection.execute(
        'UPDATE paiements SET statut = "annulé" WHERE id = ?',
        [id]
      );
      
      // 4. Récupérer la facture
      const [factures] = await connection.execute(
        'SELECT * FROM factures WHERE id = ?',
        [paiement.facture_id]
      );
      
      if (factures.length > 0) {
        const facture = factures[0];
        
        // 5. Recalculer le total payé
        const [paiementsFacture] = await connection.execute(
          `SELECT SUM(montant) as total_paye 
           FROM paiements 
           WHERE facture_id = ? AND statut = 'reçu'`,
          [paiement.facture_id]
        );
        
        const totalPaye = paiementsFacture[0].total_paye || 0;
        
        // 6. Mettre à jour le statut de la facture
        let nouveauStatut = 'validée';
        if (totalPaye >= facture.montant_ttc) {
          nouveauStatut = 'payée';
        } else if (totalPaye > 0) {
          nouveauStatut = 'partiellement_payée';
        }
        
        await connection.execute(
          'UPDATE factures SET statut = ? WHERE id = ?',
          [nouveauStatut, paiement.facture_id]
        );
        
        // 7. Mettre à jour le solde du client
        await connection.execute(
          `UPDATE clients c
           JOIN factures f ON c.id = f.client_id
           SET c.solde = c.solde + ?
           WHERE f.id = ?`,
          [paiement.montant, paiement.facture_id]
        );
      }
      
      await connection.commit();
      return true;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = Paiement;