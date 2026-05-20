const AdvisoryRequest = require('../models/AdvisoryRequest');

exports.submitRequest = async (req, res) => {
  try {
    const { name, email, phone, preferredStyle, budgetRange, spaceType, brief } = req.body;
    if (!name || !email || !phone || !brief) {
      return res.status(400).json({ msg: 'Please provide all required fields (name, email, phone, brief)' });
    }

    const newRequest = new AdvisoryRequest({
      name,
      email,
      phone,
      preferredStyle,
      budgetRange,
      spaceType,
      brief
    });

    await newRequest.save();
    res.json({ msg: 'Advisory request submitted successfully', request: newRequest });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await AdvisoryRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await AdvisoryRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }
    request.status = status;
    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const request = await AdvisoryRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }
    await AdvisoryRequest.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Request deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
