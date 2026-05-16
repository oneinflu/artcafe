const express = require('express');
const router = express.Router();
const caseStudyController = require('../controllers/caseStudyController');
const auth = require('../middleware/auth');
const cloudinaryProductUpload = require('../config/cloudinaryProduct'); // Reuse the same storage config for now

router.get('/', caseStudyController.getCaseStudies);
router.get('/:slug', caseStudyController.getCaseStudyBySlug);

router.post('/', auth('admin'), cloudinaryProductUpload.single('featuredImage'), caseStudyController.createCaseStudy);
router.put('/:id', auth('admin'), cloudinaryProductUpload.single('featuredImage'), caseStudyController.updateCaseStudy);
router.delete('/:id', auth('admin'), caseStudyController.deleteCaseStudy);

module.exports = router;
