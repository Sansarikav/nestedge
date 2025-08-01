const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Auth
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// Payments
router.post('/pay', protect, authorize('BROKER', 'OWNER', 'BUYER'), userController.pay);
router.post('/verify-payment', protect, userController.verifyPayment); // No need to authorize by role here

router.get('/me', protect, userController.getMe);

// Favorites
router.get('/favorites', protect, userController.getFavorites);
router.post('/favorites/:propertyId', protect, userController.addFavorite);
router.delete('/favorites/:propertyId', protect, userController.removeFavorite);

module.exports = router;