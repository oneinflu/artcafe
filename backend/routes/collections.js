const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', collectionController.getCollections);

router.get('/template', auth('admin'), collectionController.getTemplate);

router.post('/bulk', auth('admin'), upload.single('file'), collectionController.bulkUploadCollections);

router.post('/', auth('admin'), collectionController.createCollection);

router.put('/:id', auth('admin'), collectionController.updateCollection);

router.delete('/:id', auth('admin'), collectionController.deleteCollection);

module.exports = router;
