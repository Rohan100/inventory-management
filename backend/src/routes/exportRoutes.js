const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

router.get('/products/csv', exportController.exportProductsCSV);
router.get('/reorders/csv', exportController.exportReordersCSV);

module.exports = router;
