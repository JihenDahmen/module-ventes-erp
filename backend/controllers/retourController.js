const Retour = require('../models/Retour');
const Avoir = require('../models/Avoir');  // Ajoutez cet import
const workflowService = require('../services/workflowService');

exports.initierRetour = async (req, res) => {
  try {
    const { facture_id, client_id, motif, notes, lignes } = req.body;
    
    // Validation
    if (!facture_id || !client_id || !lignes || lignes.length === 0) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: 'facture_id, client_id et lignes sont requis'
      });
    }
    
    // Créer le retour
    const retour = await Retour.initierRetour({
      facture_id,
      client_id,
      motif,
      notes,
      lignes
    });
    
    res.status(201).json({
      success: true,
      message: 'Demande de retour initiée',
      retour: retour,
      nextSteps: [
        'validation_sav',
        'reception_logistique',
        'creation_avoir'
      ]
    });
    
  } catch (error) {
    console.error('Erreur initierRetour:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.validerRetour = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Valider le retour (SAV)
    const retour = await Retour.validerRetour(id);
    
    res.json({
      success: true,
      message: 'Retour validé par le SAV',
      retour: retour,
      action: 'validation_sav_complete',
      nextStep: 'reception_logistique'
    });
    
  } catch (error) {
    console.error('Erreur validerRetour:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      action: 'validation_sav_failed'
    });
  }
};

exports.receptionnerRetour = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Réceptionner les produits (logistique)
    const result = await Retour.receptionnerRetour(id);
    
    res.json({
      success: true,
      message: 'Produits réceptionnés et stock mis à jour',
      details: result,
      action: 'reception_logistique_complete',
      nextStep: 'creation_avoir'
    });
    
  } catch (error) {
    console.error('Erreur receptionnerRetour:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      action: 'reception_logistique_failed'
    });
  }
};

exports.creerAvoirRetour = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'avoir_client', client_id, montant } = req.body;
    
    // Validation
    if (!client_id || (type !== 'échange' && !montant)) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: type === 'échange' 
          ? 'client_id est requis' 
          : 'client_id et montant sont requis'
      });
    }
    
    // Créer l'avoir
    const avoir = await Avoir.creerAvoir({
      retour_id: id,
      client_id,
      montant: type === 'échange' ? 0 : parseFloat(montant),
      type
    });
    
    // Pour un échange, logique simplifiée (sans workflowService)
    if (type === 'échange') {
      console.log(`[ÉCHANGE] Initié pour retour ${id}, client ${client_id}`);
      // Ici, vous pouvez ajouter une logique simple pour les échanges
      // sans avoir besoin de workflowService
    }
    
    res.json({
      success: true,
      message: type === 'échange' 
        ? 'Processus d\'échange initié' 
        : 'Avoir créé avec succès',
      avoir: avoir,
      action: type === 'échange' 
        ? 'processus_échange_démarré' 
        : 'creation_avoir_complete'
    });
    
  } catch (error) {
    console.error('Erreur création avoir retour:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllRetours = async (req, res) => {
  try {
    const retours = await Retour.findAll();
    
    // Grouper par statut pour l'analyse
    const stats = {
      demandé: retours.filter(r => r.statut === 'demandé').length,
      validé: retours.filter(r => r.statut === 'validé').length,
      réceptionné: retours.filter(r => r.statut === 'réceptionné').length,
      clôturé: retours.filter(r => r.statut === 'clôturé').length,
      rejeté: retours.filter(r => r.statut === 'rejeté').length
    };
    
    res.json({
      success: true,
      count: retours.length,
      stats,
      retours
    });
    
  } catch (error) {
    console.error('Erreur getAllRetours:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getRetourById = async (req, res) => {
  try {
    const retour = await Retour.findById(req.params.id);
    
    if (!retour) {
      return res.status(404).json({
        success: false,
        error: 'Retour non trouvé'
      });
    }
    
    res.json({
      success: true,
      retour
    });
    
  } catch (error) {
    console.error('Erreur getRetourById:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.traiterRetourComplet = async (req, res) => {
  try {
    const { retourId, client_id, montant, typeAvoir = 'avoir_client' } = req.body;
    
    // 1. Valider le retour
    const validation = await Retour.validerRetour(retourId);
    
    // 2. Réceptionner
    const reception = await Retour.receptionnerRetour(retourId);
    
    // 3. Créer avoir
    const avoir = await Avoir.creerAvoir({  // Utilisez Avoir.creerAvoir
      retour_id: retourId,
      client_id,
      montant,
      type: typeAvoir
    });
    
    res.json({
      success: true,
      message: 'Processus de retour traité complètement',
      etapes: {
        validation,
        reception,
        creation_avoir: avoir
      },
      summary: {
        retourId,
        statutFinal: 'clôturé',
        avoirCree: avoir.numero,
        montant: avoir.montant
      }
    });
    
  } catch (error) {
    console.error('Erreur traiterRetourComplet:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      etapeEchouee: error.etape || 'inconnue'
    });
  }
};

exports.rejeterRetour = async (req, res) => {
  try {
    const { id } = req.params;
    const { raison } = req.body;
    
    if (!raison) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: 'La raison du rejet est requise'
      });
    }
    
    // Ajoutez cette méthode au modèle Retour si elle n'existe pas
    const result = await Retour.rejeterRetour(id, raison);
    
    res.json({
      success: true,
      message: 'Retour rejeté avec succès',
      details: result
    });
    
  } catch (error) {
    console.error('Erreur rejeterRetour:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.getRetoursByLigneFacture = async (req, res) => {
  try {
    const { ligneFactureId } = req.params;
    
    const [retours] = await db.execute(`
      SELECT lr.quantite_retournee, r.statut
      FROM lignes_retour lr
      JOIN retours r ON lr.retour_id = r.id
      WHERE lr.ligne_facture_id = ?
        AND r.statut NOT IN ('rejeté')
    `, [ligneFactureId]);
    
    const totalRetourne = retours.reduce((sum, r) => sum + r.quantite_retournee, 0);
    
    res.json({
      success: true,
      ligneFactureId,
      totalRetourne,
      retours: retours.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};