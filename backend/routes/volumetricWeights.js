const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const volumetricWeightController = require('../controllers/volumetricWeightController');

router.get('/', volumetricWeightController.list);
router.get('/lookup', volumetricWeightController.lookup);
router.post('/upsert', auth('admin'), volumetricWeightController.upsert);
router.delete('/:id', auth('admin'), volumetricWeightController.remove);

module.exports = router;
