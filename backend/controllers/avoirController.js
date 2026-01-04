const Avoir = require('../models/Avoir');
const db = require('../config/db');

exports.createAvoir = async (req, res) => {
  try {
    const { retour_id, client_id, montant, type = 'avoir_client' } = req.body;

    if (!retour_id || !client_id || !montant) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: 'retour_id, client_id et montant sont requis'
      });
    }

    const avoir = await Avoir.creerAvoir({
      retour_id,
      client_id,
      montant: parseFloat(montant),
      type
    });
    
    // Mettre à jour le solde du client
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Un avoir CRÉDITE le client : solde = solde - montant_avoir
      // Si le client était débiteur (solde positif), sa dette diminue
      // Si le client était à jour (solde 0), il devient créditeur (solde négatif)
      await connection.execute(
        'UPDATE clients SET solde = solde - ? WHERE id = ?',
        [parseFloat(montant), client_id]
      );
      
      await connection.commit();
      console.log(`✅ Avoir créé: Client ${client_id} crédité de ${montant}€`);
      
    } catch (error) {
      await connection.rollback();
      console.error('Erreur mise à jour solde avoir:', error);
    } finally {
      connection.release();
    }

    res.status(201).json({
      success: true,
      message: 'Avoir créé avec succès',
      avoir,
      action: 'avoir_created',
      clientCredited: type === 'avoir_client'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.appliquerAvoir = async (req, res) => {
  try {
    const { avoirId, factureId } = req.body;

    if (!avoirId || !factureId) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: 'avoirId et factureId sont requis'
      });
    }

    const result = await Avoir.appliquerAvoir(avoirId, factureId);

    res.json({
      success: true,
      message: 'Avoir appliqué avec succès',
      details: result,
      action: 'avoir_applied',
      factureId,
      avoirId
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAvoirs = async (req, res) => {
  try {
    const avoirs = await Avoir.findAll();

    // Statistiques
    const stats = {
      total: avoirs.length,
      généré: avoirs.filter(a => a.statut === 'généré').length,
      appliqué: avoirs.filter(a => a.statut === 'appliqué').length,
      annulé: avoirs.filter(a => a.statut === 'annulé').length
    };

    // Total montants par type
    const totalParType = {
      avoir_client: avoirs
        .filter(a => a.type === 'avoir_client')
        .reduce((sum, a) => sum + parseFloat(a.montant || 0), 0),
      remboursement: avoirs
        .filter(a => a.type === 'remboursement')
        .reduce((sum, a) => sum + parseFloat(a.montant || 0), 0),
      échange: avoirs
        .filter(a => a.type === 'échange')
        .reduce((sum, a) => sum + parseFloat(a.montant || 0), 0)
    };

    res.json({
      success: true,
      stats,
      totalParType,
      count: avoirs.length,
      avoirs
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvoirsClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const avoirs = await Avoir.disponiblesPourClient(clientId);

    const totalDisponible = avoirs.reduce((sum, a) => sum + parseFloat(a.montant || 0), 0);

    res.json({
      success: true,
      clientId,
      totalDisponible: totalDisponible.toFixed(2),
      count: avoirs.length,
      avoirs
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.annulerAvoir = async (req, res) => {
  try {
    const { id } = req.params;
    
    const avoir = await Avoir.findById(id);
    if (!avoir) {
      return res.status(404).json({
        success: false,
        error: 'Avoir non trouvé'
      });
    }
    
    if (avoir.statut !== 'généré') {
      return res.status(400).json({
        success: false,
        error: `Impossible d'annuler un avoir avec le statut "${avoir.statut}"`,
        allowedStatus: 'généré'
      });
    }
    
    const success = await Avoir.annulerAvoir(id);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Échec de l\'annulation'
      });
    }
    
    res.json({
      success: true,
      message: 'Avoir annulé avec succès',
      avoirId: id,
      previousStatus: avoir.statut,
      newStatus: 'annulé'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.effectuerRemboursement = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode_remboursement, notes } = req.body;

    const avoir = await Avoir.findById(id);
    if (!avoir) {
      return res.status(404).json({ error: 'Avoir non trouvé' });
    }

    if (avoir.type !== 'remboursement') {
      return res.status(400).json({ 
        error: 'Cet avoir n\'est pas un remboursement',
        type: avoir.type 
      });
    }

    if (avoir.statut !== 'généré') {
      return res.status(400).json({ 
        error: `Remboursement déjà ${avoir.statut}`,
        currentStatus: avoir.statut 
      });
    }

    // Marquer comme appliqué (remboursé)
    const success = await Avoir.mettreAJourStatut(id, 'appliqué');

    // Log du remboursement
    console.log(`[REMBOURSEMENT] ${avoir.numero} - ${avoir.montant}€ via ${mode_remboursement}`);

    res.json({
      success: true,
      message: 'Remboursement effectué',
      avoirId: id,
      mode: mode_remboursement,
      montant: avoir.montant,
      client: avoir.client_nom
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.demarrerProcessusEchange = async (req, res) => {
  try {
    const { id } = req.params;

    const avoir = await Avoir.findById(id);
    if (!avoir) {
      return res.status(404).json({ error: 'Avoir non trouvé' });
    }

    if (avoir.type !== 'échange') {
      return res.status(400).json({ 
        error: 'Cet avoir n\'est pas un échange',
        type: avoir.type 
      });
    }

    if (avoir.statut !== 'généré') {
      return res.status(400).json({ 
        error: `Échange déjà ${avoir.statut}`,
        currentStatus: avoir.statut 
      });
    }

    // Utiliser 'appliqué' au lieu de 'en_traitement'
    const success = await Avoir.mettreAJourStatut(id, 'appliqué');

    console.log(`[ÉCHANGE] ${avoir.numero} - Processus démarré`);

    res.json({
      success: true,
      message: 'Processus d\'échange démarré',
      avoirId: id,
      statut: 'appliqué',
      nextSteps: [
        'Vérifier disponibilité produit',
        'Préparer bon de livraison',
        'Mettre à jour stocks',
        'Organiser expédition'
      ]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};