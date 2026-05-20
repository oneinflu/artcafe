const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const auth = require('../middleware/auth');

router.post('/subscribe', newsletterController.subscribe);
router.get('/subscribers', auth('admin'), newsletterController.getSubscribers);
router.delete('/subscribers/:id', auth('admin'), newsletterController.deleteSubscriber);

module.exports = router;
