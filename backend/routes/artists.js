const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const auth = require('../middleware/auth');
const path = require('path');
const multer = require('multer');

console.log('Artists Router Loading...');

const localUpload = multer({ dest: path.join(__dirname, '../uploads/') });

router.get('/template', (req, res, next) => {
  console.log('Artists Template Route Hit');
  next();
}, auth('admin'), artistController.getTemplate);

router.post('/bulk', auth('admin'), localUpload.single('file'), artistController.bulkUpload);

router.get('/', (req, res, next) => {
  console.log('Artists Get All Route Hit');
  next();
}, artistController.getAll);

router.post('/', auth('admin'), artistController.create);
router.put('/:id', auth('admin'), artistController.update);
router.delete('/:id', auth('admin'), artistController.delete);

console.log('Artists Router Loaded');
module.exports = router;
