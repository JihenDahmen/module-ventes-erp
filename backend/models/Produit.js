const db = require('../config/db');

const Produit = {
  // Trouver tous les produits
  findAll: async () => {
    const [rows] = await db.execute(`
      SELECT *,
      ROUND(prix_ht * (1 + tva/100), 2) as prix_ttc,
      CASE
        WHEN stock < 10 THEN 'faible'
        WHEN stock < 50 THEN 'moyen'
        ELSE 'bon'
      END as niveau_stock
      FROM produits
      ORDER BY nom ASC
    `);
    return rows;
  },

  // Trouver un produit par ID
  findById: async (id) => {
    const [rows] = await db.execute(
      'SELECT * FROM produits WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Mettre à jour le stock
  updateStock: async (id, quantite) => {
    const [result] = await db.execute(
      'UPDATE produits SET stock = stock + ? WHERE id = ?',
      [quantite, id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Produit;