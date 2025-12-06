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
        const [devisRows] = await db.query('SELECT COUNT(*) as totalDevis FROM devis');
        const [commandesRows] = await db.query('SELECT COUNT(*) as totalCommandes FROM commandes');

        const totalDevis = devisRows[0].totalDevis || 0;
        const totalCommandes = commandesRows[0].totalCommandes || 0;

        const rate = totalDevis > 0 ? (totalCommandes / totalDevis) * 100 : 0;

        res.json({
            totalDevis,
            totalCommandes,
            conversionRate: rate.toFixed(2) + '%'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPendingPayments = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM ventes WHERE statut LIKE '%attente%' OR statut LIKE '%pending%'");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMargins = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT SUM(montant) as totalRevenue, SUM(cout_achat) as totalCost FROM ventes');
        const revenue = rows[0].totalRevenue || 0;
        const cost = rows[0].totalCost || 0;
        const margin = revenue - cost;
        const marginRate = revenue > 0 ? (margin / revenue) * 100 : 0;

        res.json({
            totalRevenue: revenue,
            totalCost: cost,
            netMargin: margin,
            marginRate: marginRate.toFixed(2) + '%'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReturns = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM ventes WHERE statut = 'retourné'");
        const count = rows.length;
        let totalValue = 0;
        rows.forEach(r => totalValue += parseFloat(r.montant));

        res.json({
            returnedItemsCount: count,
            totalReturnedValue: totalValue,
            details: rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
