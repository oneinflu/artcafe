const express = require('express');
const router = express.Router();
const styleController = require('../controllers/styleController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// @route   GET api/styles
router.get('/', styleController.getStyles);

// @route   POST api/styles
router.post('/', auth('admin'), styleController.createStyle);

// @route   POST api/styles/bulk
router.post('/bulk', auth('admin'), upload.single('file'), styleController.bulkUploadStyles);

// @route   PUT api/styles/:id
router.put('/:id', auth('admin'), styleController.updateStyle);

// @route   DELETE api/styles/:id
router.delete('/:id', auth('admin'), styleController.deleteStyle);

module.exports = router;
