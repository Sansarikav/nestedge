// routes/property.routes.js
const express = require('express');
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  searchProperties
} = require('../controllers/property.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/my', protect, getMyProperties); // GET /api/properties/my

// Public Routes
router.get('/', getAllProperties); // GET /api/properties
router.get('/search', searchProperties);
router.get('/:id', getPropertyById); // GET /api/properties/:id

// Protected Routes
router.post('/', protect, createProperty); // POST /api/properties

router.put('/:id', protect, updateProperty); // PUT /api/properties/:id
router.delete('/:id', protect, deleteProperty); // DELETE /api/properties/:id

module.exports = router;