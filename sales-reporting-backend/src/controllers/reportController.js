const db = require('../config/db');

exports.getTotalRevenue = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT SUM(montant) as totalRevenue FROM ventes');
        res.json({ totalRevenue: rows[0].totalRevenue || 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesByProduct = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT produit_id as produit, COUNT(*) as count, SUM(montant) as revenue FROM ventes GROUP BY produit_id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesByClient = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT client_id as client, COUNT(*) as count, SUM(montant) as revenue FROM ventes GROUP BY client_id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesByRegion = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT region, COUNT(*) as count, SUM(montant) as revenue FROM ventes GROUP BY region');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getConversionRate = async (req, res) => {
    try {
        // Tables 'devis' and 'commandes' do not exist in the current schema.
        // Returning 0 values to prevent crash.
        // Ideally, this should query 'devis' and 'commandes' tables if they existed.

        res.json({
            totalDevis: 0,
            totalCommandes: 0,
            conversionRate: 0,
            note: "Tables 'devis' and 'commandes' not found. conversion rate cannot be calculated."
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPendingPayments = async (req, res) => {
    try {
        // Assuming 'statut' column holds payment status info, checking for 'attente'
        const [rows] = await db.query("SELECT * FROM ventes WHERE statut LIKE '%attente%' OR statut LIKE '%pending%'");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
