const TradeApplication = require('../models/TradeApplication');
const Architect = require('../models/Architect');
const User = require('../models/User');

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
    const { status, commission, couponCode } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }

    const application = await TradeApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    application.status = status;
    await application.save();

    let responseData = { application };

    // If approved and the role is one of the Trade Partner roles, create the User and Partner (Architect model) documents
    const tradeRoles = ['Interior Designer', 'Architect', 'Real Estate Developer', 'Art Consultant'];
    if (status === 'approved' && tradeRoles.includes(application.role)) {
      const commissionVal = Number(commission) || 0;
      
      // Get role prefix for referral coupon code
      let rolePrefix = 'TRD';
      if (application.role === 'Interior Designer') rolePrefix = 'DSGN';
      else if (application.role === 'Architect') rolePrefix = 'ARCH';
      else if (application.role === 'Real Estate Developer') rolePrefix = 'DEV';
      else if (application.role === 'Art Consultant') rolePrefix = 'CONS';

      // Auto-generate Coupon/Referral Code if not provided
      let finalCouponCode = couponCode;
      if (!finalCouponCode) {
        const cleanName = application.name.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 5);
        finalCouponCode = `${rolePrefix}-${cleanName}-${Math.floor(100 + Math.random() * 900)}`;
      }

      // Check if Partner already exists in Architect collection
      let partner = await Architect.findOne({ email: application.email });
      if (!partner) {
        partner = new Architect({
          name: application.name,
          email: application.email,
          firm: application.company,
          commission: commissionVal,
          couponCode: finalCouponCode,
          category: application.role,
          bio: `Approved ${application.role} via Trade Program`,
          projectsCount: 0
        });
        await partner.save();
      } else {
        // Update existing partner
        partner.commission = commissionVal;
        partner.couponCode = finalCouponCode;
        partner.category = application.role;
        await partner.save();
      }

      // Check if User already exists
      let user = await User.findOne({ email: application.email });
      let tempPassword = null;
      let userCreated = false;

      if (!user) {
        tempPassword = 'ArtCafe#' + Math.floor(1000 + Math.random() * 9000);
        user = new User({
          name: application.name,
          email: application.email,
          password: tempPassword,
          role: 'architect', // 'architect' is the login account role for all trade partners
          phone: application.phone
        });
        await user.save();
        userCreated = true;
      } else {
        // Upgrade existing user role if needed
        user.role = 'architect';
        await user.save();
      }

      responseData = {
        application,
        architect: partner,
        couponCode: finalCouponCode,
        tempPassword,
        userCreated,
        email: application.email
      };
    }

    res.json(responseData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
