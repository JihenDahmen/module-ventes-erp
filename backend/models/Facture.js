const db = require('../config/db');

const Facture = {
  // Générer numéro de facture
  generateNumero: async () => {
    const year = new Date().getFullYear();
    const [result] = await db.execute(
      'SELECT COUNT(*) as count FROM factures WHERE YEAR(date_facture) = ?',
      [year]
    );
    const count = result[0].count + 1;
    return `FACT-${year}-${String(count).padStart(4, '0')}`;
  },

  // Créer facture AVEC ses lignes
  create: async (factureData) => {
    const { client_id, lignes } = factureData;
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Générer numéro
      const numero = await Facture.generateNumero();
      const date_facture = new Date().toISOString().split('T')[0];
      
      // Créer facture (sans montants initiaux)
      const [factureResult] = await connection.execute(
        `INSERT INTO factures
         (numero, client_id, date_facture, montant_ht, montant_tva, montant_ttc, statut)
         VALUES (?, ?, ?, 0, 0, 0, 'brouillon')`,
        [numero, client_id, date_facture]
      );
      
      const factureId = factureResult.insertId;
      let totalHT = 0;
      
      // Ajouter les lignes de facture
      for (const ligne of lignes) {
        const sousTotal = ligne.prix_unitaire * ligne.quantite * (1 - (ligne.remise || 0) / 100);
        totalHT += sousTotal;
        
        await connection.execute(
          `INSERT INTO lignes_facture
           (facture_id, produit_id, quantite, prix_unitaire, remise, sous_total)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [factureId, ligne.produit_id, ligne.quantite,
           ligne.prix_unitaire, ligne.remise || 0, sousTotal]
        );
        
        // Mettre à jour le stock
        await connection.execute(
          'UPDATE produits SET stock = stock - ? WHERE id = ?',
          [ligne.quantite, ligne.produit_id]
        );
      }
      
      // Calculer et mettre à jour les montants finaux
      const tvaRate = 0.20;
      const finalHT = totalHT;
      const finalTVA = finalHT * tvaRate;
      const finalTTC = finalHT + finalTVA;
      
      await connection.execute(
        `UPDATE factures
         SET montant_ht = ?, montant_tva = ?, montant_ttc = ?
         WHERE id = ?`,
        [finalHT, finalTVA, finalTTC, factureId]
      );
      
      await connection.commit();
      
      return {
        id: factureId,
        numero,
        montant_ht: finalHT,
        montant_tva: finalTVA,
        montant_ttc: finalTTC,
        lignes_count: lignes.length
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Valider une facture
  valider: async (id) => {
    const [result] = await db.execute(
      `UPDATE factures 
       SET statut = 'validée' 
       WHERE id = ? AND statut = 'brouillon'`,
      [id]
    );
    return result.affectedRows > 0;
  },

  // Vérifier si une facture peut être payée
  peutEtrePayee: async (id) => {
    const [rows] = await db.execute(
      'SELECT statut FROM factures WHERE id = ?',
      [id]
    );
    return rows[0] && (rows[0].statut === 'validée' || rows[0].statut === 'partiellement_payée');
  },

  // Trouver toutes les factures
  findAll: async () => {
    const [rows] = await db.execute(`
      SELECT f.*,
             c.nom as client_nom,
             c.email as client_email,
             (SELECT SUM(montant) FROM paiements WHERE facture_id = f.id AND statut = 'reçu') as total_paye,
             COALESCE(f.montant_ttc, 0) as montant_ttc  -- Assurer que montant_ttc n'est pas null
      FROM factures f
      JOIN clients c ON f.client_id = c.id
      ORDER BY f.created_at DESC
    `);
    return rows;
  },

   // Trouver une facture par ID
  findById: async (id) => {
    try {
      console.log(`Recherche facture ID: ${id}`); // Debug
      
      // 1. Récupérer la facture de base
      const [factures] = await db.execute(`
        SELECT f.*, 
               c.nom as client_nom,
               c.email as client_email,
               c.telephone as client_telephone,
               c.adresse as client_adresse
        FROM factures f
        LEFT JOIN clients c ON f.client_id = c.id
        WHERE f.id = ?
      `, [id]);
      
      if (factures.length === 0) {
        console.log(`Aucune facture trouvée avec ID: ${id}`);
        return null;
      }
      
      const facture = factures[0];
      console.log(`Facture trouvée: ${facture.numero}`); // Debug
      
      // 2. Récupérer les lignes de facture
      const [lignes] = await db.execute(`
        SELECT lf.*,
               p.nom as produit_nom,
               p.reference as produit_reference
        FROM lignes_facture lf
        LEFT JOIN produits p ON lf.produit_id = p.id
        WHERE lf.facture_id = ?
      `, [id]);
      
      facture.lignes = lignes || [];
      console.log(`Lignes trouvées: ${lignes.length}`); // Debug
      
      // 3. Récupérer les paiements
      const [paiements] = await db.execute(
        `SELECT * FROM paiements 
         WHERE facture_id = ? 
         ORDER BY date_paiement DESC`,
        [id]
      );
      
      facture.paiements = paiements || [];
      console.log(`Paiements trouvés: ${paiements.length}`); // Debug
      
      // 4. Calculer le total payé
      facture.total_paye = paiements.reduce((sum, p) => {
        if (p.statut === 'reçu') {
          return sum + parseFloat(p.montant || 0);
        }
        return sum;
      }, 0);
      
      return facture;
      
    } catch (error) {
      console.error('Erreur dans findById:', error);
      throw error;
    }
  }
};

module.exports = Facture;