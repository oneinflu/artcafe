const express = require('express');
const router = express.Router();
const architectController = require('../controllers/architectController');
const auth = require('../middleware/auth');
const path = require('path');
const multer = require('multer');

console.log('Architects Router Loading...');

const localUpload = multer({ dest: path.join(__dirname, '../uploads/') });

router.get('/template', (req, res, next) => {
  console.log('Architects Template Route Hit');
  next();
}, auth('admin'), architectController.getTemplate);

router.post('/bulk', auth('admin'), localUpload.single('file'), architectController.bulkUpload);

router.get('/', (req, res, next) => {
  console.log('Architects Get All Route Hit');
  next();
}, architectController.getAll);

router.post('/', auth('admin'), architectController.create);
router.put('/:id', auth('admin'), architectController.update);
router.delete('/:id', auth('admin'), architectController.delete);

console.log('Architects Router Loaded');
module.exports = router;
