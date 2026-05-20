const TradeApplication = require('../models/TradeApplication');

exports.createTradeApplication = async (req, res) => {
  try {
    const { name, email, phone, company, role, message } = req.body;
    if (!name || !email || !phone || !role) {
      return res.status(400).json({ msg: 'Please provide all required fields: name, email, phone, and role.' });
    }

    const newApplication = new TradeApplication({
      name,
      email,
      phone,
      company,
      role,
      message
    });

    await newApplication.save();
    res.json(newApplication);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getTradeApplications = async (req, res) => {
  try {
    const applications = await TradeApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateTradeApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }

    const application = await TradeApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    application.status = status;
    await application.save();
    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
