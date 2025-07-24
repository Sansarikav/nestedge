const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/buyer', protect, dashboardController.getBuyerDashboard);
router.get('/broker', protect, dashboardController.getBrokerDashboard);
router.get('/owner', protect, dashboardController.getOwnerDashboard);

module.exports = router;