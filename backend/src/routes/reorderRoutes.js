const express = require('express');
const router = express.Router();
const reorderController = require('../controllers/reorderController');

// Reorder routes
router.get('/', reorderController.getAllReorders);
router.get('/:id', reorderController.getReorderById);
router.post('/:id/request-otp', reorderController.requestOTP);
router.post('/:id/approve-otp', reorderController.approveReorderWithOTP);

module.exports = router;
