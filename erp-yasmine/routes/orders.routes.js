const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orders.controller');

router.post('/', ctrl.createOrder);
router.get('/', ctrl.getAllOrders);
router.get('/:id', ctrl.getOrderById);
router.put('/:id/status', ctrl.updateOrderStatus);

module.exports = router;
