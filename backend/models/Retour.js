const db = require('../config/db');

const Retour = {
  // Générer référence de retour
  generateReference: async () => {
    const year = new Date().getFullYear();
    const [result] = await db.execute(
      'SELECT COUNT(*) as count FROM retours WHERE YEAR(date_retour) = ?',
      [year]
    );
    const count = result[0].count + 1;
    return `RET-${year}-${String(count).padStart(4, '0')}`;
  },

  // Initier un retour
  initierRetour: async (retourData) => {
    const { facture_id, client_id, motif, notes, lignes } = retourData;
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Générer référence
      const reference = await Retour.generateReference();
      const date_retour = new Date().toISOString().split('T')[0];
      
      // Créer le retour
      const [retourResult] = await connection.execute(
        `INSERT INTO retours
         (reference, facture_id, client_id, date_retour, motif, notes, statut)
         VALUES (?, ?, ?, ?, ?, ?, 'demandé')`,
        [reference, facture_id, client_id, date_retour, motif, notes || null]
      );
      
      const retourId = retourResult.insertId;
      
      // Ajouter les lignes de retour
      for (const ligne of lignes) {
        // Vérifier que la ligne de facture existe
        const [ligneFacture] = await connection.execute(
          'SELECT produit_id, quantite FROM lignes_facture WHERE id = ? AND facture_id = ?',
          [ligne.ligne_facture_id, facture_id]
        );
        
        if (ligneFacture.length === 0) {
          throw new Error(`Ligne de facture ${ligne.ligne_facture_id} non trouvée`);
        }
        
        // Vérifier que la quantité retournée est valide
        const quantiteRetournee = ligne.quantite_retournee || 0;
        if (quantiteRetournee > ligneFacture[0].quantite || quantiteRetournee <= 0) {
          throw new Error(`Quantité retournée invalide pour le produit ${ligne.produit_id}`);
        }
        
        await connection.execute(
          `INSERT INTO lignes_retour
           (retour_id, produit_id, ligne_facture_id, quantite_retournee, raison)
           VALUES (?, ?, ?, ?, ?)`,
          [retourId, 
           ligne.produit_id, 
           ligne.ligne_facture_id,
           quantiteRetournee, 
           ligne.raison || null]
        );
      }
      
      await connection.commit();
      
      return {
        id: retourId,
        reference,
        statut: 'demandé',
        lignes_count: lignes.length
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Valider un retour (SAV)
  validerRetour: async (id) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Vérifier que le retour existe et est en statut demandé
      const [retour] = await connection.execute(
        'SELECT * FROM retours WHERE id = ? AND statut = "demandé"',
        [id]
      );
      
      if (retour.length === 0) {
        throw new Error('Retour non trouvé ou déjà traité');
      }
      
      // Valider le retour
      const date_validation = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const valide_par = "Admin";
      
      await connection.execute(
        `UPDATE retours 
         SET statut = "validé", 
             date_validation = ?,
             valide_par = ?
         WHERE id = ?`,
        [date_validation, valide_par, id]
      );
      
      await connection.commit();
      
      return {
        id,
        statut: 'validé',
        date_validation
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

// Réceptionner un retour (Logistique) - Version avec logging
receptionnerRetour: async (id) => {
  console.log('🚀 ===== DÉBUT receptionnerRetour =====');
  console.log('📌 ID reçu:', id);
  console.log('📌 Type de ID:', typeof id);
  console.log('📌 ID parsé:', parseInt(id));
  
  // Validation de l'ID
  const retourId = parseInt(id);
  if (isNaN(retourId) || retourId <= 0) {
    console.error('❌ ID invalide:', id);
    throw new Error(`ID de retour invalide: ${id}`);
  }
  
  console.log('📌 ID validé:', retourId);
  
  const connection = await db.getConnection();
  try {
    console.log('🔗 Connexion DB établie');
    await connection.beginTransaction();
    console.log('🔄 Transaction débutée');
    
    // 1. Vérifier que le retour existe et est validé
    console.log(`🔍 Recherche retour ID ${retourId} avec statut "validé"...`);
    const [retour] = await connection.execute(
      'SELECT id, reference, statut FROM retours WHERE id = ? AND statut = "validé"',
      [retourId]
    );
    
    console.log(`📊 Résultat recherche: ${retour.length} ligne(s) trouvée(s)`);
    if (retour.length > 0) {
      console.log(`📄 Retour trouvé:`, retour[0]);
    }
    
    if (retour.length === 0) {
      // Vérifier si le retour existe mais avec un autre statut
      console.log(`🔍 Recherche retour ID ${retourId} sans condition de statut...`);
      const [retourExiste] = await connection.execute(
        'SELECT id, statut FROM retours WHERE id = ?',
        [retourId]
      );
      
      if (retourExiste.length === 0) {
        console.error(`❌ Retour avec ID ${retourId} n'existe pas`);
        throw new Error(`Retour avec ID ${retourId} non trouvé`);
      } else {
        console.error(`❌ Retour existe mais statut "${retourExiste[0].statut}" != "validé"`);
        throw new Error(`Retour ID ${retourId} a le statut "${retourExiste[0].statut}" mais doit être "validé"`);
      }
    }
    
    // 2. Récupérer les lignes de retour
    console.log(`🔍 Recherche lignes de retour pour retour_id ${retourId}...`);
    const [lignes] = await connection.execute(
      'SELECT id, produit_id, quantite_retournee FROM lignes_retour WHERE retour_id = ?',
      [retourId]
    );
    
    console.log(`📊 Lignes trouvées: ${lignes.length}`);
    if (lignes.length > 0) {
      console.log(`📄 Lignes détail:`, lignes);
    }
    
    if (lignes.length === 0) {
      console.error('❌ Aucune ligne de retour trouvée');
      throw new Error('Aucune ligne de retour trouvée pour ce retour');
    }
    
    // 3. Vérifier que les produits existent
    const produitIds = lignes.map(l => l.produit_id).filter(id => id);
    console.log(`🔍 Vérification produits:`, produitIds);
    
    if (produitIds.length > 0) {
      const [produits] = await connection.execute(
        `SELECT id, nom FROM produits WHERE id IN (${produitIds.join(',')})`
      );
      console.log(`📊 Produits existants: ${produits.length}`);
    }
    
    // 4. Mettre à jour le stock pour chaque produit
    console.log('🔄 Début mise à jour stocks...');
    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const quantite = parseInt(ligne.quantite_retournee) || 1;
      const produitId = parseInt(ligne.produit_id);
      
      console.log(`  📦 Ligne ${i + 1}: produit ${produitId}, quantité ${quantite}`);
      
      if (!produitId || isNaN(produitId)) {
        console.error(`  ❌ Produit ID invalide: ${ligne.produit_id}`);
        throw new Error(`Produit ID invalide dans ligne_retour: ${ligne.produit_id}`);
      }
      
      try {
        const [result] = await connection.execute(
          'UPDATE produits SET stock = stock + ? WHERE id = ?',
          [quantite, produitId]
        );
        console.log(`  ✅ Stock mis à jour (lignes affectées: ${result.affectedRows})`);
      } catch (err) {
        console.error(`  ❌ Erreur UPDATE produit ${produitId}:`, err.message);
        throw err;
      }
    }
    
    // 5. Marquer le retour comme réceptionné
    const date_reception = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const receptionne_par = "Logistique";
    
    console.log(`🔄 Mise à jour statut retour...`);
    console.log(`  📅 Date réception: ${date_reception}`);
    console.log(`  👤 Réceptionné par: ${receptionne_par}`);
    console.log(`  🆔 ID retour: ${retourId}`);
    
    try {
      const [updateResult] = await connection.execute(
        `UPDATE retours 
         SET statut = "réceptionné",
             date_reception = ?,
             receptionne_par = ?
         WHERE id = ?`,
        [date_reception, receptionne_par, retourId]
      );
      
      console.log(`✅ Statut mis à jour (lignes affectées: ${updateResult.affectedRows})`);
      
      if (updateResult.affectedRows === 0) {
        console.error(`❌ Aucune ligne affectée par l'UPDATE`);
        throw new Error(`Échec de la mise à jour du statut du retour ID ${retourId}`);
      }
    } catch (err) {
      console.error(`❌ Erreur UPDATE retours:`, err.message);
      throw err;
    }
    
    await connection.commit();
    console.log('✅ Transaction commitée avec succès');
    
    const result = {
      id: retourId,
      statut: 'réceptionné',
      produitsMisAJour: lignes.length,
      date_reception
    };
    
    console.log('📤 Résultat à retourner:', result);
    console.log('🏁 ===== FIN receptionnerRetour =====\n');
    
    return result;
    
  } catch (error) {
    console.error('❌ ERREUR DANS receptionnerRetour:', error.message);
    console.error('📋 Stack:', error.stack);
    
    if (connection) {
      await connection.rollback();
      console.log('↩️ Transaction rollbackée');
    }
    
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log('🔓 Connexion DB libérée');
    }
  }
},

  // Trouver tous les retours
  findAll: async () => {
    const [rows] = await db.execute(`
      SELECT r.*,
             f.numero as facture_numero,
             c.nom as client_nom,
             c.email as client_email,
             (SELECT COUNT(*) FROM lignes_retour WHERE retour_id = r.id) as lignes_count
      FROM retours r
      JOIN factures f ON r.facture_id = f.id
      JOIN clients c ON r.client_id = c.id
      ORDER BY r.created_at DESC
    `);
    return rows;
  },

  // Trouver un retour par ID
  findById: async (id) => {
    const [retours] = await db.execute(`
      SELECT r.*,
             f.numero as facture_numero,
             c.nom as client_nom,
             c.email as client_email
      FROM retours r
      JOIN factures f ON r.facture_id = f.id
      JOIN clients c ON r.client_id = c.id
      WHERE r.id = ?
    `, [id]);
    
    if (retours.length === 0) return null;
    
    const retour = retours[0];
    
    // Lignes de retour
    const [lignes] = await db.execute(`
      SELECT lr.*,
             p.nom as produit_nom,
             p.reference as produit_reference,
             lf.quantite as quantite_originale
      FROM lignes_retour lr
      JOIN produits p ON lr.produit_id = p.id
      JOIN lignes_facture lf ON lr.ligne_facture_id = lf.id
      WHERE lr.retour_id = ?
    `, [id]);
    
    retour.lignes = lignes;
    
    return retour;
  },

  // Créer un avoir pour un retour
  creerAvoirRetour: async (retourData) => {
    const { retour_id, client_id, montant, type = 'avoir_client' } = retourData;
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Vérifier que le retour est réceptionné
      const [retour] = await connection.execute(
        'SELECT * FROM retours WHERE id = ? AND statut = "réceptionné"',
        [retour_id]
      );
      
      if (retour.length === 0) {
        throw new Error('Retour non réceptionné ou non trouvé');
      }
      
      // Générer le numéro d'avoir
      const year = new Date().getFullYear();
      const [countResult] = await connection.execute(
        'SELECT COUNT(*) as count FROM avoirs WHERE YEAR(date_avoir) = ?',
        [year]
      );
      const count = countResult[0].count + 1;
      const numero = `AVOIR-${year}-${String(count).padStart(4, '0')}`;
      
      const date_avoir = new Date().toISOString().split('T')[0];
      
      // Créer l'avoir
      const [result] = await connection.execute(
        `INSERT INTO avoirs
         (numero, retour_id, client_id, montant, type, date_avoir, statut)
         VALUES (?, ?, ?, ?, ?, ?, 'généré')`,
        [numero, retour_id, client_id, montant, type, date_avoir]
      );
      
      const avoirId = result.insertId;
      
      // Si c'est un avoir client, créditer son compte
      if (type === 'avoir_client') {
        await connection.execute(
          'UPDATE clients SET solde = solde - ? WHERE id = ?',
          [montant, client_id]
        );
      }
      
      // Clôturer le retour associé
      const date_cloture = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const cloture_par = "Système";
      
      await connection.execute(
        `UPDATE retours 
         SET statut = "clôturé",
             date_cloture = ?,
             cloture_par = ?
         WHERE id = ?`,
        [date_cloture, cloture_par, retour_id]
      );
      
      await connection.commit();
      
      return {
        id: avoirId,
        numero,
        montant,
        type,
        statut: 'généré',
        retour_id,
        client_id
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Rejeter un retour
  rejeterRetour: async (id, raison) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      const [retour] = await connection.execute(
        'SELECT * FROM retours WHERE id = ? AND statut = "demandé"',
        [id]
      );
      
      if (retour.length === 0) {
        throw new Error('Retour non trouvé ou déjà traité');
      }
      
      const date_rejet = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const rejete_par = "Admin";
      const raisonRejet = raison || 'Raison non spécifiée';
      
      await connection.execute(
        `UPDATE retours 
         SET statut = "rejeté",
             raison_rejet = ?,
             rejete_par = ?,
             date_validation = ?
         WHERE id = ?`,
        [raisonRejet, rejete_par, date_rejet, id]
      );
      
      await connection.commit();
      
      return {
        id,
        statut: 'rejeté',
        date_rejet,
        raison: raisonRejet
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = Retour;