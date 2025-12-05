const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/total-revenue', reportController.getTotalRevenue);
router.get('/sales-by-product', reportController.getSalesByProduct);
router.get('/sales-by-client', reportController.getSalesByClient);
router.get('/sales-by-region', reportController.getSalesByRegion);
router.get('/conversion-rate', reportController.getConversionRate);
router.get('/pending-payments', reportController.getPendingPayments);

module.exports = router;
