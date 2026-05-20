const BrandLogo = require('../models/BrandLogo');

exports.getLogos = async (req, res) => {
  try {
    const logos = await BrandLogo.find().sort({ createdAt: -1 });
    res.json(logos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createLogo = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ msg: 'Please provide a name' });
    }
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a logo image' });
    }

    const newLogo = new BrandLogo({
      name,
      image: req.file.path // Cloudinary URL
    });

    await newLogo.save();
    res.json(newLogo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteLogo = async (req, res) => {
  try {
    const logo = await BrandLogo.findById(req.params.id);
    if (!logo) {
      return res.status(404).json({ msg: 'Logo not found' });
    }

    await BrandLogo.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Logo deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
