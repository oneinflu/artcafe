const Newsletter = require('../models/Newsletter');

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Please provide a valid email address' });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ msg: 'This email is already subscribed to our newsletter' });
    }

    const newSub = new Newsletter({
      email: email.toLowerCase().trim()
    });

    await newSub.save();
    res.json({ msg: 'Thank you for subscribing to our newsletter!', subscriber: newSub });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getSubscribers = async (req, res) => {
  try {
    const subs = await Newsletter.find().sort({ subscribedAt: -1 });
    res.json(subs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteSubscriber = async (req, res) => {
  try {
    const sub = await Newsletter.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ msg: 'Subscriber not found' });
    }
    await Newsletter.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Subscriber removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
