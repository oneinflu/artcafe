const express = require('express');
const router = express.Router();
const bulkRequestController = require('../controllers/bulkRequestController');
const auth = require('../middleware/auth');

// @route   POST api/bulk-requests
// @desc    Create a bulk inquiry
// @access  Public
router.post('/', bulkRequestController.createBulkRequest);

// @route   GET api/bulk-requests
// @desc    Get all bulk inquiries
// @access  Private (Admin)
router.get('/', auth('admin'), bulkRequestController.getBulkRequests);

// @route   PUT api/bulk-requests/:id
// @desc    Update status
// @access  Private (Admin)
router.put('/:id', auth('admin'), bulkRequestController.updateBulkRequestStatus);

// @route   POST api/bulk-requests/:id/proposal
// @desc    Send a proposal
// @access  Private (Admin)
router.post('/:id/proposal', auth('admin'), bulkRequestController.sendProposal);

module.exports = router;
