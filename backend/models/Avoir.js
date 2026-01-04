const db = require('../config/db');

const Avoir = {
   // Générer un numéro d'avoir
  generateNumero: async () => {
    const year = new Date().getFullYear();
    const [result] = await db.execute(
      'SELECT COUNT(*) as count FROM avoirs WHERE YEAR(date_avoir) = ?',
      [year]
    );
    const count = result[0].count + 1;
    return `AVOIR-${year}-${String(count).padStart(4, '0')}`;
  },

creerAvoir: async (avoirData) => {
  const { retour_id, client_id, montant, type } = avoirData;
  
  console.log('=== MODELE: creerAvoir ===');
  console.log('Données:', avoirData);
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Vérifier si un avoir existe déjà pour ce retour
    const [avoirExiste] = await connection.execute(
      'SELECT id FROM avoirs WHERE retour_id = ?',
      [retour_id]
    );
    
    if (avoirExiste.length > 0) {
      throw new Error(`Un avoir existe déjà pour le retour ${retour_id}`);
    }
    
    // Générer le numéro
    const numero = await Avoir.generateNumero();
    const date_avoir = new Date().toISOString().split('T')[0];
    
    console.log('Création avoir:', { numero, date_avoir });
    
    // Créer l'avoir
    const [result] = await connection.execute(
      `INSERT INTO avoirs
       (numero, retour_id, client_id, montant, type, date_avoir, statut)
       VALUES (?, ?, ?, ?, ?, ?, 'généré')`,
      [numero, retour_id, client_id, montant, type || 'avoir_client', date_avoir]
    );
    
    const avoirId = result.insertId;
    console.log('Avoir ID créé:', avoirId);
    
    // Si c'est un avoir client, créditer son compte
    if (type === 'avoir_client') {
      await connection.execute(
        'UPDATE clients SET solde = solde - ? WHERE id = ?',
        [montant, client_id]
      );
      console.log('Client crédité:', client_id, 'Montant:', montant);
    }
    
    // Clôturer le retour associé
    await connection.execute(
      'UPDATE retours SET statut = "clôturé" WHERE id = ?',
      [retour_id]
    );
    
    console.log('Retour clôturé:', retour_id);
    
    await connection.commit();
    
    console.log('Transaction commitée');
    
    return {
      id: avoirId,
      numero,
      montant,
      type: type || 'avoir_client',
      statut: 'généré'
    };
    
  } catch (error) {
    console.error('Erreur dans creerAvoir:', error.message);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
},
  // Appliquer un avoir sur une facture
  appliquerAvoir: async (avoirId, factureId) => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Vérifier l'avoir
      const avoir = await Avoir.findById(avoirId);
      if (!avoir || avoir.statut !== 'généré') {
        throw new Error('Avoir non disponible ou déjà appliqué');
      }
      
      // Créer un paiement "avoir" pour la facture
      const referencePaiement = `PAY-AVOIR-${avoir.numero}`;
      
      await connection.execute(
        `INSERT INTO paiements
         (reference, facture_id, montant, mode_paiement, date_paiement, statut, notes)
         VALUES (?, ?, ?, 'avoir', CURDATE(), 'reçu', ?)`,
        [referencePaiement, factureId, avoir.montant, `Avoir appliqué: ${avoir.numero}`]
      );
      
      // Marquer l'avoir comme appliqué
      await connection.execute(
        'UPDATE avoirs SET statut = "appliqué" WHERE id = ?',
        [avoirId]
      );
      
      await connection.commit();
      
      return {
        success: true,
        avoirId,
        factureId,
        montant: avoir.montant,
        referencePaiement
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Trouver tous les avoirs
  findAll: async () => {
    const [rows] = await db.execute(`
      SELECT a.*,
             r.reference as retour_reference,
             c.nom as client_nom,
             c.email as client_email
      FROM avoirs a
      JOIN retours r ON a.retour_id = r.id
      JOIN clients c ON a.client_id = c.id
      ORDER BY a.created_at DESC
    `);
    return rows;
  },

  // Trouver un avoir par ID
  findById: async (id) => {
    const [rows] = await db.execute(
      'SELECT * FROM avoirs WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Avoirs disponibles pour un client
  disponiblesPourClient: async (clientId) => {
    const [rows] = await db.execute(
      `SELECT a.*, r.reference as retour_reference
       FROM avoirs a
       JOIN retours r ON a.retour_id = r.id
       WHERE a.client_id = ? AND a.statut = 'généré'
       ORDER BY a.date_avoir DESC`,
      [clientId]
    );
    return rows;
  },

  // Annuler un avoir
annulerAvoir: async (id) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Récupérer l'avoir
    const avoir = await Avoir.findById(id);
    if (!avoir || avoir.statut !== 'généré') {
      throw new Error('Avoir non trouvé ou déjà traité');
    }
    
    // Si c'était un avoir client, réajuster le solde client
    if (avoir.type === 'avoir_client') {
      await connection.execute(
        'UPDATE clients SET solde = solde + ? WHERE id = ?',
        [avoir.montant, avoir.client_id]
      );
      console.log(`Solde client ${avoir.client_id} réajusté de +${avoir.montant}`);
    }
    
    // Marquer l'avoir comme annulé
    const [result] = await connection.execute(
      'UPDATE avoirs SET statut = "annulé" WHERE id = ?',
      [id]
    );
    
    await connection.commit();
    
    return result.affectedRows > 0;
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
},
// Dans models/Avoir.js
mettreAJourStatut: async (id, nouveauStatut) => {
  const [result] = await db.execute(
    'UPDATE avoirs SET statut = ? WHERE id = ?',
    [nouveauStatut, id]
  );
  return result.affectedRows > 0;
}
};

module.exports = Avoir;