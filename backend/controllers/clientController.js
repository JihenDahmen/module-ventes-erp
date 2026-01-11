const Client = require('../models/Client');
const db = require('../config/db');

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();

    // Analyse des soldes
    const analyseSoldes = {
      totalClients: clients.length,
      clientsSoldePositif: clients.filter(c => parseFloat(c.solde) > 0).length,
      clientsSoldeNegatif: clients.filter(c => parseFloat(c.solde) < 0).length,
      clientsSoldeZero: clients.filter(c => parseFloat(c.solde) === 0).length,
      totalSoldePositif: clients
        .filter(c => parseFloat(c.solde) > 0)
        .reduce((sum, c) => sum + parseFloat(c.solde), 0),
      totalSoldeNegatif: Math.abs(clients
        .filter(c => parseFloat(c.solde) < 0)
        .reduce((sum, c) => sum + parseFloat(c.solde), 0))
    };

    res.json({
      success: true,
      analyse: analyseSoldes,
      count: clients.length,
      clients
    });

  } catch (error) {
    console.error('Erreur dans getAllClients:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.getClientById = async (req, res) => {
  try {
    console.log('Requête pour client ID:', req.params.id);
    
    const client = await Client.findById(req.params.id);
    console.log('Client trouvé:', client);

    if (!client) {
      console.log('Client non trouvé');
      return res.status(404).json({
        success: false,
        error: 'Client non trouvé'
      });
    }

    // Déterminer la situation du client
    let situation = 'à jour';
    if (parseFloat(client.solde) > 0) situation = 'débiteur';
    if (parseFloat(client.solde) < 0) situation = 'créancier';

    res.json({
      success: true,
      client: {
        ...client,
        situation,
        soldeAbsolu: Math.abs(parseFloat(client.solde) || 0)
      }
    });

  } catch (error) {
    console.error('Erreur dans getClientById:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { nom, email, telephone, adresse } = req.body;

    if (!nom || nom.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        details: 'Le nom est requis'
      });
    }

    const clientId = await Client.create({
      nom: nom.trim(),
      email: email ? email.trim() : null,
      telephone: telephone ? telephone.trim() : null,
      adresse: adresse ? adresse.trim() : null
    });

    res.status(201).json({
      success: true,
      message: 'Client créé avec succès',
      clientId,
      client: {
        id: clientId,
        nom: nom.trim(),
        email: email ? email.trim() : null,
        telephone: telephone ? telephone.trim() : null,
        adresse: adresse ? adresse.trim() : null
      }
    });

  } catch (error) {
    console.error('Erreur dans createClient:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.getClientBalance = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client non trouvé'
      });
    }

    res.json({
      success: true,
      clientId: client.id,
      nom: client.nom,
      solde: parseFloat(client.solde) || 0,
      situation: parseFloat(client.solde) > 0 ? 'débiteur' : 
                  parseFloat(client.solde) < 0 ? 'créancier' : 'à jour'
    });

  } catch (error) {
    console.error('Erreur dans getClientBalance:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si le client existe
    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client non trouvé'
      });
    }
    
    // Vérifier si le client a des factures (quel que soit le statut)
    const [facturesResult] = await db.execute(
      'SELECT COUNT(*) as count FROM factures WHERE client_id = ?',
      [id]
    );
    
    const facturesCount = facturesResult[0]?.count || 0;
    
    if (facturesCount > 0) {
      // Récupérer le détail des factures pour le message
      const [facturesDetails] = await db.execute(
        'SELECT numero, statut, montant_ttc FROM factures WHERE client_id = ? LIMIT 5',
        [id]
      );
      
      return res.status(400).json({
        success: false,
        error: 'Impossible de supprimer ce client',
        details: {
          message: 'Le client a des factures associées',
          facturesCount,
          factures: facturesDetails,
          suggestion: 'Supprimez d\'abord les factures ou archivez le client'
        }
      });
    }
    
    // Vérifier aussi les retours et avoirs pour être complet
    const [retoursResult] = await db.execute(
      'SELECT COUNT(*) as count FROM retours WHERE client_id = ?',
      [id]
    );
    
    const [avoirsResult] = await db.execute(
      'SELECT COUNT(*) as count FROM avoirs WHERE client_id = ?',
      [id]
    );
    
    const retoursCount = retoursResult[0]?.count || 0;
    const avoirsCount = avoirsResult[0]?.count || 0;
    
    if (retoursCount > 0 || avoirsCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Impossible de supprimer ce client',
        details: {
          message: 'Le client a des données associées',
          factures: facturesCount,
          retours: retoursCount,
          avoirs: avoirsCount,
          suggestion: 'Supprimez d\'abord toutes les données associées'
        }
      });
    }
    
    // Supprimer le client (s'il n'a aucune donnée associée)
    const success = await Client.delete(id);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression'
      });
    }
    
    res.json({
      success: true,
      message: 'Client supprimé avec succès',
      client: {
        id,
        nom: client.nom,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Erreur dans deleteClient:', error);
    
    // Gestion spécifique des contraintes de clé étrangère
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'Impossible de supprimer ce client',
        details: {
          message: 'Le client a des données associées',
          suggestion: 'Vérifiez les factures, retours et avoirs associés'
        }
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, email, telephone, adresse } = req.body;

    // Vérifier si le client existe
    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client non trouvé'
      });
    }

    if (!nom || nom.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        details: 'Le nom est requis'
      });
    }

    // Mettre à jour le client
    const [result] = await db.execute(
      'UPDATE clients SET nom = ?, email = ?, telephone = ?, adresse = ?, updated_at = NOW() WHERE id = ?',
      [nom.trim(), email ? email.trim() : null, telephone ? telephone.trim() : null, 
       adresse ? adresse.trim() : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client non trouvé ou aucune modification'
      });
    }

    // Récupérer le client mis à jour
    const updatedClient = await Client.findById(id);

    res.json({
      success: true,
      message: 'Client mis à jour avec succès',
      client: {
        id,
        nom: updatedClient.nom,
        email: updatedClient.email,
        telephone: updatedClient.telephone,
        adresse: updatedClient.adresse,
        solde: parseFloat(updatedClient.solde) || 0,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur dans updateClient:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// NOUVELLE MÉTHODE : Vérifier si un client peut être supprimé
exports.checkIfClientCanBeDeleted = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si le client existe
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client non trouvé'
      });
    }
    
    // Vérifier toutes les données associées
    const [facturesResult] = await db.execute(
      'SELECT COUNT(*) as count FROM factures WHERE client_id = ?',
      [id]
    );
    
    const [retoursResult] = await db.execute(
      'SELECT COUNT(*) as count FROM retours WHERE client_id = ?',
      [id]
    );
    
    const [avoirsResult] = await db.execute(
      'SELECT COUNT(*) as count FROM avoirs WHERE client_id = ?',
      [id]
    );
    
    const facturesCount = facturesResult[0]?.count || 0;
    const retoursCount = retoursResult[0]?.count || 0;
    const avoirsCount = avoirsResult[0]?.count || 0;
    
    const canDelete = facturesCount === 0 && retoursCount === 0 && avoirsCount === 0;
    
    res.json({
      success: true,
      canDelete,
      client: {
        id: client.id,
        nom: client.nom,
        email: client.email
      },
      details: {
        factures: facturesCount,
        retours: retoursCount,
        avoirs: avoirsCount,
        message: canDelete 
          ? 'Le client peut être supprimé (aucune donnée associée)' 
          : 'Le client a des données associées'
      }
    });
    
  } catch (error) {
    console.error('Erreur dans checkIfClientCanBeDeleted:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
exports.recalculerSolde = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Total factures non annulées
    const [facturesResult] = await db.execute(
      `SELECT COALESCE(SUM(montant_ttc), 0) as total_factures
       FROM factures
       WHERE client_id = ? AND statut NOT IN ('annulée', 'brouillon')`,
      [id]
    );
    
    const totalFactures = parseFloat(facturesResult[0].total_factures);
    
    // 2. Total paiements reçus
    const [paiementsResult] = await db.execute(
      `SELECT COALESCE(SUM(p.montant), 0) as total_paiements
       FROM paiements p
       JOIN factures f ON p.facture_id = f.id
       WHERE f.client_id = ? AND p.statut = 'reçu'`,
      [id]
    );
    
    const totalPaiements = parseFloat(paiementsResult[0].total_paiements);
    
    // 3. Total avoirs générés
    const [avoirsResult] = await db.execute(
      `SELECT COALESCE(SUM(montant), 0) as total_avoirs
       FROM avoirs
       WHERE client_id = ? AND type = 'avoir_client' AND statut = 'généré'`,
      [id]
    );
    
    const totalAvoirs = parseFloat(avoirsResult[0].total_avoirs);
    
    // 4. Calcul du nouveau solde
    const nouveauSolde = totalFactures - totalPaiements - totalAvoirs;
    
    // 5. Mettre à jour le client
    await db.execute(
      'UPDATE clients SET solde = ? WHERE id = ?',
      [nouveauSolde, id]
    );
    
    // 6. Récupérer le client mis à jour
    const client = await Client.findById(id);
    
    res.json({
      success: true,
      message: 'Solde recalculé avec succès',
      calcul: {
        totalFactures,
        totalPaiements,
        totalAvoirs,
        calcul: `${totalFactures} - ${totalPaiements} - ${totalAvoirs} = ${nouveauSolde}`
      },
      client: {
        id: client.id,
        nom: client.nom,
        ancienSolde: client.solde,
        nouveauSolde,
        situation: nouveauSolde > 0 ? 'débiteur' : 
                  nouveauSolde < 0 ? 'créancier' : 'à jour'
      }
    });
    
  } catch (error) {
    console.error('Erreur recalcul solde:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};