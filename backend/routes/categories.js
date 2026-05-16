const express = require('express');
const router = express.Router();
console.log('Category Router Initialized');
router.use((req, res, next) => {
  console.log(`Category Router Hit: ${req.method} ${req.url}`);
  next();
});
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

const cloudinaryUpload = require('../config/cloudinary');

// @route   GET api/categories
router.get('/', categoryController.getCategories);

// @route   POST api/categories
// Use cloudinaryUpload.single('image') for creating a category with an image
router.post('/', auth('admin'), cloudinaryUpload.single('image'), categoryController.createCategory);

// @route   POST api/categories/bulk
router.post('/bulk', auth('admin'), upload.single('file'), categoryController.bulkUploadCategories);

// @route   PUT api/categories/:id
// Use cloudinaryUpload.single('image') for updating a category with an image
router.put('/:id', auth('admin'), cloudinaryUpload.single('image'), categoryController.updateCategory);

// @route   DELETE api/categories/:id
router.delete('/:id', auth('admin'), categoryController.deleteCategory);

module.exports = router;
