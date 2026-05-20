const express = require('express');
const router = express.Router();
const advisoryController = require('../controllers/advisoryController');
const auth = require('../middleware/auth');

router.post('/', advisoryController.submitRequest);
router.get('/', auth('admin'), advisoryController.getRequests);
router.put('/:id', auth('admin'), advisoryController.updateStatus);
router.delete('/:id', auth('admin'), advisoryController.deleteRequest);

module.exports = router;
