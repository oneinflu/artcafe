const Architect = require('../models/Architect');
const User = require('../models/User');

exports.getAll = async (req, res) => {
  try {
    const items = await Architect.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = new Architect(req.body);
    
    // Auto-generate Coupon Code if commission exists
    if (req.body.commission && req.body.name) {
      const cleanName = req.body.name.replace(/\s+/g, '').toUpperCase().substring(0, 5);
      item.couponCode = `${cleanName}${req.body.commission}`;
    }

    await item.save();

    // Create User account if email provided
    if (req.body.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (!existingUser) {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: 'SET_PASSWORD_ON_LOGIN', // Placeholder
          role: 'architect'
        });
        await newUser.save();
      }
    }

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.commission && updateData.name) {
      const cleanName = updateData.name.replace(/\s+/g, '').toUpperCase().substring(0, 5);
      updateData.couponCode = `${cleanName}${updateData.commission}`;
    }
    const item = await Architect.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Architect.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const fs = require('fs');
const csv = require('csv-parser');

exports.getTemplate = async (req, res) => {
  const headers = ['Name', 'Email', 'Bio', 'Firm', 'ProjectsCompleted', 'ImageURL', 'Commission', 'IsFeatured'];
  const csvContent = headers.join(',') + '\n' + 
    `"Zaha Hadid","hadid@example.com","Iraqi-British architect","Zaha Hadid Architects","50","https://example.com/hadid.jpg","10","true"`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=architect_template.csv');
  res.status(200).send(csvContent);
};

exports.bulkUpload = async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        for (const row of results) {
          const name = (row.Name || row.name || '').trim();
          const commission = parseInt(row.Commission || row.commission || 0);
          let couponCode = '';
          if (name && commission) {
            const cleanName = name.replace(/\s+/g, '').toUpperCase().substring(0, 5);
            couponCode = `${cleanName}${commission}`;
          }

          await Architect.findOneAndUpdate({ name }, {
            name,
            email: (row.Email || row.email || '').trim(),
            bio: row.Bio || row.bio || '',
            firm: row.Firm || row.firm || '',
            projectsCount: parseInt(row.ProjectsCompleted || row.projectsCount || 0),
            image: row.ImageURL || row.image || '',
            commission,
            couponCode,
            isFeatured: (row.IsFeatured || row.isFeatured) === 'true'
          }, { upsert: true, new: true });

          // Also handle User creation for bulk uploads
          const email = (row.Email || row.email || '').trim();
          if (email) {
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
              const newUser = new User({
                name: name.trim(),
                email: email,
                password: 'SET_PASSWORD_ON_LOGIN',
                role: 'architect'
              });
              await newUser.save();
            }
          }
        }
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json({ msg: `${results.length} architects processed successfully` });
      } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ msg: err.message });
      }
    });
};
