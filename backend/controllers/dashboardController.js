const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    console.log('=== DÉBUT CALCUL STATS DASHBOARD ===');
    
    // Récupérer toutes les statistiques en parallèle
    const [
      clientsResult,
      facturesResult,
      paiementsResult,
      retoursResult,
      produitsResult
    ] = await Promise.all([
      // CORRECTION: On récupère le tableau complet, pas seulement [clientsStats]
      db.execute('SELECT COUNT(*) as total, COALESCE(SUM(solde), 0) as total_solde FROM clients'),
      db.execute('SELECT COUNT(*) as total, COALESCE(SUM(montant_ttc), 0) as total_montant FROM factures'),
      db.execute('SELECT COUNT(*) as total, COALESCE(SUM(montant), 0) as total_montant FROM paiements WHERE statut = "reçu"'),
      db.execute('SELECT COUNT(*) as total FROM retours'),
      db.execute('SELECT COUNT(*) as total, COALESCE(SUM(stock), 0) as total_stock, COALESCE(SUM(prix_ht * stock), 0) as valeur_stock FROM produits')
    ]);

    console.log('Résultats bruts:');
    console.log('- Clients:', clientsResult[0][0]);
    console.log('- Factures:', facturesResult[0][0]);
    console.log('- Paiements:', paiementsResult[0][0]);
    console.log('- Produits:', produitsResult[0][0]);

    // CORRECTION: Accédez correctement aux résultats
    const clientsStats = clientsResult[0][0] || {};
    const facturesStats = facturesResult[0][0] || {};
    const paiementsStats = paiementsResult[0][0] || {};
    const retoursStats = retoursResult[0][0] || {};
    const produitsStats = produitsResult[0][0] || {};

    // Statistiques par statut
    const [facturesParStatutResult] = await db.execute(`
      SELECT statut, COUNT(*) as count 
      FROM factures 
      GROUP BY statut
    `);

    const [retoursParStatutResult] = await db.execute(`
      SELECT statut, COUNT(*) as count 
      FROM retours 
      GROUP BY statut
    `);

    // Dernières activités
    const [dernieresFacturesResult] = await db.execute(`
      SELECT f.numero, f.montant_ttc, f.statut, c.nom as client_nom, f.created_at
      FROM factures f
      JOIN clients c ON f.client_id = c.id
      ORDER BY f.created_at DESC
      LIMIT 5
    `);

    const [derniersPaiementsResult] = await db.execute(`
      SELECT p.reference, p.montant, p.mode_paiement, f.numero as facture_numero, p.created_at
      FROM paiements p
      JOIN factures f ON p.facture_id = f.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        clients: {
          total: parseInt(clientsStats.total) || 0,
          total_solde: parseFloat(clientsStats.total_solde) || 0
        },
        factures: {
          total: parseInt(facturesStats.total) || 0,
          total_montant: parseFloat(facturesStats.total_montant) || 0,
          par_statut: facturesParStatutResult || []
        },
        paiements: {
          total: parseInt(paiementsStats.total) || 0,
          total_montant: parseFloat(paiementsStats.total_montant) || 0
        },
        retours: {
          total: parseInt(retoursStats.total) || 0,
          par_statut: retoursParStatutResult || []
        },
        produits: {
          total: parseInt(produitsStats.total) || 0,
          total_stock: parseInt(produitsStats.total_stock) || 0,
          valeur_stock: parseFloat(produitsStats.valeur_stock) || 0
        }
      },
      recent: {
        factures: dernieresFacturesResult || [],
        paiements: derniersPaiementsResult || []
      }
    };

    console.log('=== RÉPONSE FINALE ===');
    console.log(JSON.stringify(response, null, 2));

    res.json(response);

  } catch (error) {
    console.error('❌ Erreur dans getDashboardStats:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};