const CaseStudy = require('../models/CaseStudy');

exports.getCaseStudies = async (req, res) => {
  try {
    const studies = await CaseStudy.find().populate('category').sort({ createdAt: -1 });
    res.json(studies);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getCaseStudyBySlug = async (req, res) => {
  try {
    const study = await CaseStudy.findOne({ slug: req.params.slug }).populate('category');
    if (!study) return res.status(404).json({ msg: 'Case study not found' });
    res.json(study);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createCaseStudy = async (req, res) => {
  try {
    const data = { ...req.body };
    // Handle featured image from cloudinary if uploaded
    if (req.file) {
      data.featuredImage = req.file.path;
    }
    
    // Auto-generate slug if not provided
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const newStudy = new CaseStudy(data);
    await newStudy.save();
    res.json(newStudy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.updateCaseStudy = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.featuredImage = req.file.path;
    }

    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    
    const study = await CaseStudy.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!study) return res.status(404).json({ msg: 'Case study not found' });
    res.json(study);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteCaseStudy = async (req, res) => {
  try {
    await CaseStudy.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Case study deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
