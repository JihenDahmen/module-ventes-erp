const db = require('../database');

module.exports = {

    async createQuote(data) {
        const { client_id, items } = data;

        // Calcul total
        let total = 0;
        items.forEach(i => total += i.quantity * i.unit_price);
        const taxes = total * 0.19;

        const [quote] = await db.query(
            "INSERT INTO quotes (client_id, total, taxes) VALUES (?,?,?)",
            [client_id, total, taxes]
        );

        for (const item of items) {
            await db.query(
                "INSERT INTO quote_items (quote_id, product_id, quantity, unit_price) VALUES (?,?,?,?)",
                [quote.insertId, item.product_id, item.quantity, item.unit_price]
            );
        }

        return { id: quote.insertId, client_id, total, taxes };
    },

    async getAllQuotes() {
        const [rows] = await db.query("SELECT * FROM quotes");
        return rows;
    },

    async getQuoteById(id) {
        const [rows] = await db.query("SELECT * FROM quotes WHERE id = ?", [id]);
        return rows[0];
    },

    async updateQuoteStatus(id, status) {
        await db.query("UPDATE quotes SET status=? WHERE id=?", [status, id]);
        return { id, status };
    },

    async convertToOrder(quote_id) {
        // Vérifier devis
        const [quoteData] = await db.query("SELECT * FROM quotes WHERE id=?", [quote_id]);

        if (!quoteData.length) throw new Error("Devis introuvable");
        if (quoteData[0].status !== "validé") 
            throw new Error("Devis non validé, conversion impossible");

        // Créer commande
        const [order] = await db.query(
            "INSERT INTO orders (client_id, total) VALUES (?,?)",
            [quoteData[0].client_id, quoteData[0].total]
        );

        // Copier les lignes devis -> commandes_items
        await db.query(`
            INSERT INTO order_items (order_id, product_id, quantity, unit_price)
            SELECT ?, product_id, quantity, unit_price FROM quote_items WHERE quote_id=?
        `, [order.insertId, quote_id]);

        return { message: "Commande créée avec succès", order_id: order.insertId };
    }

};
