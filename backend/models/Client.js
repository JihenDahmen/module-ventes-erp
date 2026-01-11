const db = require('../config/db');

const Client = {
  // Créer un nouveau client
  create: async (clientData) => {
    const { nom, email, telephone, adresse } = clientData;
    
    const [result] = await db.execute(
      'INSERT INTO clients (nom, email, telephone, adresse) VALUES (?, ?, ?, ?)',
      [nom, email || null, telephone || null, adresse || null]
    );
    
    return result.insertId;
  },

  // Trouver tous les clients
  findAll: async () => {
    const [rows] = await db.execute(`
      SELECT *,
      CASE
        WHEN solde > 0 THEN 'débiteur'
        WHEN solde < 0 THEN 'créancier'
        ELSE 'à jour'
      END as situation
      FROM clients
      ORDER BY nom ASC
    `);
    return rows;
  },

  // Trouver un client par ID
    findById: async (id) => {
    console.log('Recherche client ID:', id);
    try {
      const [rows] = await db.execute(
        'SELECT * FROM clients WHERE id = ?',
        [id]
      );
      console.log('Résultat requête:', rows);
      return rows[0] || null;
    } catch (error) {
      console.error('Erreur dans findById:', error);
      throw error;
    }
  },
  delete: async (id) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Vérifier si le client a des avoirs
      const [avoirs] = await connection.execute(
        'SELECT COUNT(*) as count FROM avoirs WHERE client_id = ? AND statut = "généré"',
        [id]
      );
      
      if (avoirs[0].count > 0) {
        throw new Error('Le client a des avoirs non utilisés');
      }
      
      // Supprimer le client
      const [result] = await connection.execute(
        'DELETE FROM clients WHERE id = ?',
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
  }
};

module.exports = Client;