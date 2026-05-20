const express = require('express');
const router = express.Router();
const brandLogoController = require('../controllers/brandLogoController');
const auth = require('../middleware/auth');
const cloudinaryUpload = require('../config/cloudinary');

router.get('/', brandLogoController.getLogos);
router.post('/', auth('admin'), cloudinaryUpload.single('image'), brandLogoController.createLogo);
router.delete('/:id', auth('admin'), brandLogoController.deleteLogo);

module.exports = router;
