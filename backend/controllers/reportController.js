const db = require('../config/db');

exports.getTotalRevenue = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT COALESCE(SUM(montant), 0) as totalRevenue FROM ventes WHERE statut = "payé"');
        res.json({ totalRevenue: rows[0].totalRevenue });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSalesByProduct = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT p.nom as produit, COUNT(v.id) as count, SUM(v.montant) as revenue 
            FROM ventes v 
            JOIN produits p ON v.produit_id = p.id 
            GROUP BY p.id
            ORDER BY revenue DESC 
            LIMIT 5
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSalesByClient = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT c.nom as client, COUNT(v.id) as count, SUM(v.montant) as revenue 
            FROM ventes v 
            JOIN clients c ON v.client_id = c.id 
            GROUP BY c.id
            ORDER BY revenue DESC 
            LIMIT 5
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSalesByRegion = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT region, COUNT(id) as count, SUM(montant) as revenue FROM ventes GROUP BY region');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getConversionRate = async (req, res) => {
    try {
        const [devis] = await db.execute('SELECT COUNT(*) as total FROM quotes');
        const [commandes] = await db.execute('SELECT COUNT(*) as total FROM orders');

        const totalDevis = devis[0].total;
        const totalCommandes = commandes[0].total;
        const rate = totalDevis > 0 ? ((totalCommandes / totalDevis) * 100).toFixed(2) : 0;

        res.json({ conversionRate: rate + '%', totalDevis, totalCommandes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPendingPayments = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, client_id, montant_ttc as total, statut as status, created_at as date FROM factures WHERE statut = "validée" LIMIT 5');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMargins = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT SUM(montant - cout_achat) as netMargin, SUM(montant) as totalRevenue FROM ventes WHERE statut = "payé"');
        const netMargin = rows[0].netMargin || 0;
        const totalRevenue = rows[0].totalRevenue || 0;
        const marginRate = totalRevenue > 0 ? ((netMargin / totalRevenue) * 100).toFixed(2) : 0;

        res.json({ netMargin, marginRate: marginRate + '%' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReturns = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT COUNT(*) as count, SUM(montant) as value FROM ventes WHERE statut = "retourné"');
        res.json({ returnedItemsCount: rows[0].count, totalReturnedValue: rows[0].value || 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
