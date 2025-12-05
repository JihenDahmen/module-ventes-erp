const db = require('../database');

module.exports = {

    // Vérifier si le stock est suffisant
    async checkStock(product_id, qty) {
        const [rows] = await db.query(
            "SELECT stock FROM products WHERE id = ?",
            [product_id]
        );

        if (!rows.length) {
            throw new Error(`Produit ${product_id} introuvable`);
        }

        return rows[0].stock >= qty;
    },

    // Déduire du stock après création commande
    async decreaseStock(product_id, qty) {
        await db.query(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            [qty, product_id]
        );
    },

    // Ajouter du stock (optionnel)
    async increaseStock(product_id, qty) {
        await db.query(
            "UPDATE products SET stock = stock + ? WHERE id = ?",
            [qty, product_id]
        );
    },

    // Obtenir produits
    async getProduct(product_id) {
        const [rows] = await db.query(
            "SELECT * FROM products WHERE id = ?",
            [product_id]
        );

        return rows[0];
    }

};
