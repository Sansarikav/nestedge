const express = require('express');
const router = express.Router();
const brokerController = require('../controllers/broker.controller');
const { protect, authorize, isSubscribed } = require('../middlewares/auth.middleware');

// Protect all broker routes
router.use(protect);

// Broker-only routes
router.post('/create-profile', isSubscribed, authorize('BROKER'), brokerController.createProfile);
router.get('/my-profile', authorize('BROKER'), brokerController.getMyProfile);
router.put('/update-profile', authorize('BROKER'), brokerController.updateProfile); 
router.delete('/delete-profile', authorize('BROKER'), brokerController.deleteProfile); 
router.post('/feature-order', protect, authorize('BROKER'), brokerController.createFeaturedOrder);
router.post('/verify-featured', protect, authorize('BROKER'), brokerController.verifyFeaturedPayment);

// Public route
router.get('/list', brokerController.getBrokers);
router.get('/:id', brokerController.getBrokerById); 

module.exports = router;