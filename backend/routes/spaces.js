const express = require('express');
const router = express.Router();
const spaceController = require('../controllers/spaceController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// @route   GET api/spaces
router.get('/', spaceController.getSpaces);

// @route   POST api/spaces
router.post('/', auth('admin'), spaceController.createSpace);

// @route   POST api/spaces/bulk
router.post('/bulk', auth('admin'), upload.single('file'), spaceController.bulkUploadSpaces);

// @route   PUT api/spaces/:id
router.put('/:id', auth('admin'), spaceController.updateSpace);

// @route   DELETE api/spaces/:id
router.delete('/:id', auth('admin'), spaceController.deleteSpace);

module.exports = router;
