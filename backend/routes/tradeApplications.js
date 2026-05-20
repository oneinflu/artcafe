const express = require('express');
const router = express.Router();
const tradeApplicationController = require('../controllers/tradeApplicationController');
const auth = require('../middleware/auth');

// @route   POST api/trade-applications
// @desc    Submit a trade program application
// @access  Public
router.post('/', tradeApplicationController.createTradeApplication);

// @route   GET api/trade-applications
// @desc    Get all trade applications
// @access  Private (Admin)
router.get('/', auth('admin'), tradeApplicationController.getTradeApplications);

// @route   PUT api/trade-applications/:id
// @desc    Update trade application status
// @access  Private (Admin)
router.put('/:id', auth('admin'), tradeApplicationController.updateTradeApplicationStatus);

module.exports = router;
