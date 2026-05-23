const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const cloudinaryProductUpload = require('../config/cloudinaryProduct');

console.log('Products Router Loading...');

const localUpload = multer({ dest: path.join(__dirname, '../uploads/') });

router.get('/exclusive', productController.getExclusiveProducts);
router.get('/rentals', productController.getRentalProducts);
router.get('/rentals/template', productController.getRentalTemplate);
router.post('/rentals/bulk', auth('admin'), localUpload.single('file'), productController.bulkUploadRentalProducts);
router.get('/template', productController.getTemplate);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

router.post('/bulk', auth('admin'), localUpload.single('file'), productController.bulkUploadProducts);
router.post('/bulk-delete', auth('admin'), productController.bulkDeleteProducts);
router.post('/', auth('admin'), cloudinaryProductUpload.array('images', 10), productController.createProduct);
router.put('/:id', auth('admin'), cloudinaryProductUpload.array('images', 10), productController.updateProduct);
router.delete('/:id', auth('admin'), productController.deleteProduct);

console.log('Products Router Loaded');
module.exports = router;
