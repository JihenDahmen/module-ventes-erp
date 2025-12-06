const db = require('../database');
const StockService = require('./stock.service');

module.exports = {

    async createOrder(data) {
        const { client_id, items } = data;

        // Vérification stock
        for (const item of items) {
            const isAvailable = await StockService.checkStock(item.product_id, item.quantity);
            if (!isAvailable) throw new Error(`Stock insuffisant pour le produit ${item.product_id}`);
        }

        // Calcul total
        let total = 0;
        items.forEach(i => total += i.unit_price * i.quantity);

        const [order] = await db.query(
            "INSERT INTO orders (client_id, total) VALUES (?,?)",
            [client_id, total]
        );

        // Déduire stock
        for (const item of items) {
            await StockService.decreaseStock(item.product_id, item.quantity);

            await db.query(
                "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)",
                [order.insertId, item.product_id, item.quantity, item.unit_price]
            );
        }

        return { id: order.insertId, client_id, total };
    },

    async getAllOrders() {
        const [rows] = await db.query("SELECT * FROM orders");
        return rows;
    },

    async getOrderById(id) {
        const [rows] = await db.query("SELECT * FROM orders WHERE id=?", [id]);
        return rows[0];
    },

    async updateOrderStatus(id, status) {
        await db.query("UPDATE orders SET status=? WHERE id=?", [status, id]);
        return { id, status };
    }

};
