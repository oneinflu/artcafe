const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

// @route   GET api/shipping/check-pincode
// @desc    Verify pincode courier serviceability
// @access  Public
router.get('/check-pincode', shippingController.checkPincode);

module.exports = router;
