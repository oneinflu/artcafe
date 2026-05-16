const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');
const auth = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const localUpload = multer({ dest: path.join(__dirname, '../uploads/') });

// @route   GET api/attributes
router.get('/', attributeController.getAttributeGroups);

// @route   POST api/attributes/bulk
router.post('/bulk', auth('admin'), localUpload.single('file'), attributeController.bulkUploadAttributes);

// @route   POST api/attributes
router.post('/', auth('admin'), attributeController.createAttributeGroup);

// @route   PUT api/attributes/:id
router.put('/:id', auth('admin'), attributeController.updateAttributeGroup);

// @route   DELETE api/attributes/:id
router.delete('/:id', auth('admin'), attributeController.deleteAttributeGroup);

module.exports = router;
