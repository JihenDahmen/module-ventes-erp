const db = require('../config/db');

exports.getTotalRevenue = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT SUM(total) as totalRevenue FROM orders');
        res.json({ totalRevenue: rows[0].totalRevenue || 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesByProduct = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.name as produit, 
                COUNT(DISTINCT o.id) as count, 
                SUM(oi.quantity * oi.unit_price) as revenue 
            FROM orders o 
            JOIN order_items oi ON o.id = oi.order_id 
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id, p.name
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesByClient = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                c.name as client, 
                COUNT(o.id) as count, 
                SUM(o.total) as revenue 
            FROM orders o 
            JOIN clients c ON o.client_id = c.id 
            GROUP BY c.id, c.name
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesByRegion = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                c.region, 
                COUNT(o.id) as count, 
                SUM(o.total) as revenue 
            FROM orders o 
            JOIN clients c ON o.client_id = c.id 
            GROUP BY c.region
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getConversionRate = async (req, res) => {
    try {
        const [devisRows] = await db.query('SELECT COUNT(*) as totalDevis FROM quotes');
        const [commandesRows] = await db.query('SELECT COUNT(*) as totalCommandes FROM orders');

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
        const [rows] = await db.query("SELECT * FROM orders WHERE pay_status LIKE '%pending%' OR pay_status LIKE '%unpaid%'");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMargins = async (req, res) => {
    try {
        const [revenueRows] = await db.query('SELECT SUM(total) as totalRevenue FROM orders');
        const [costRows] = await db.query(`
            SELECT SUM(oi.quantity * p.cost_price) as totalCost 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id
        `);

        const revenue = revenueRows[0].totalRevenue || 0;
        const cost = costRows[0].totalCost || 0;
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
        const [rows] = await db.query("SELECT * FROM orders WHERE status = 'returned'");

        let totalValue = 0;
        rows.forEach(r => totalValue += parseFloat(r.total));

        res.json({
            returnedItemsCount: rows.length,
            totalReturnedValue: totalValue,
            details: rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
