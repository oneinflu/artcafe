const BulkRequest = require('../models/BulkRequest');

exports.createBulkRequest = async (req, res) => {
  try {
    const newRequest = new BulkRequest(req.body);
    await newRequest.save();
    res.json(newRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getBulkRequests = async (req, res) => {
  try {
    const requests = await BulkRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateBulkRequestStatus = async (req, res) => {
  try {
    const request = await BulkRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });

    request.status = req.body.status;
    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.sendProposal = async (req, res) => {
  try {
    const { amount, notes, fileUrl } = req.body;
    const request = await BulkRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });

    request.proposal = {
      amount,
      notes,
      fileUrl,
      sentAt: new Date()
    };
    request.status = 'Quoted';
    await request.save();

    // TODO: Integrate Nodemailer to send actual email to request.email
    console.log(`Proposal sent to ${request.email} for amount ${amount}`);

    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
