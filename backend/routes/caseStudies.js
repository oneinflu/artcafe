const express = require('express');
const router = express.Router();
const caseStudyController = require('../controllers/caseStudyController');
const auth = require('../middleware/auth');
const cloudinaryProductUpload = require('../config/cloudinaryProduct'); // Reuse the same storage config for now

router.get('/', caseStudyController.getCaseStudies);
router.get('/:slug', caseStudyController.getCaseStudyBySlug);

const uploadFields = cloudinaryProductUpload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'beforeImage', maxCount: 1 },
  { name: 'afterImage', maxCount: 1 }
]);

router.post('/', auth('admin'), uploadFields, caseStudyController.createCaseStudy);
router.put('/:id', auth('admin'), uploadFields, caseStudyController.updateCaseStudy);
router.delete('/:id', auth('admin'), caseStudyController.deleteCaseStudy);

module.exports = router;
