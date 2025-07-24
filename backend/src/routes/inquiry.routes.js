const express = require('express');
const router = express.Router();
const { createInquiry, getMyInquiries } = require('../controllers/inquiry.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', protect, createInquiry);       // POST /api/inquiries
router.get('/my', protect, getMyInquiries);     // GET /api/inquiries/my

module.exports = router;