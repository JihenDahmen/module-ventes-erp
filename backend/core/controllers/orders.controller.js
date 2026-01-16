const OrderService = require('../services/orders.service');

module.exports = {

    async createOrder(req, res) {
        try {
            const order = await OrderService.createOrder(req.body);
            res.status(201).json(order);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getAllOrders(req, res) {
        try {
            const orders = await OrderService.getAllOrders();
            res.json(orders);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getOrderById(req, res) {
        try {
            const order = await OrderService.getOrderById(req.params.id);
            res.json(order);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async updateOrderStatus(req, res) {
        try {
            const updated = await OrderService.updateOrderStatus(req.params.id, req.body.status);
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

};
