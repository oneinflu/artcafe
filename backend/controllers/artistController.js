const Artist = require('../models/Artist');
const User = require('../models/User');

exports.getAll = async (req, res) => {
  try {
    const items = await Artist.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = new Artist(req.body);
    await item.save();

    // Create User account if email provided
    if (req.body.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (!existingUser) {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: 'SET_PASSWORD_ON_LOGIN', // Placeholder
          role: 'artist'
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
    const item = await Artist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Artist.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const fs = require('fs');
const csv = require('csv-parser');

exports.getTemplate = async (req, res) => {
  const headers = ['Name', 'Email', 'Bio', 'Specialty', 'ImageURL', 'PortfolioURL', 'IsFeatured'];
  const csvContent = headers.join(',') + '\n' + 
    `"Pablo Picasso","picasso@example.com","Famous Spanish painter","Cubism","https://example.com/picasso.jpg","https://picasso.com","true"`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=artist_template.csv');
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
          const name = row.Name || row.name;
          if (!name) continue;

          await Artist.findOneAndUpdate({ name: name.trim() }, {
            name: name.trim(),
            email: (row.Email || row.email || '').trim(),
            bio: row.Bio || row.bio || '',
            specialty: row.Specialty || row.specialty || '',
            image: row.ImageURL || row.image || '',
            portfolioUrl: row.PortfolioURL || row.portfolioUrl || '',
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
                role: 'artist'
              });
              await newUser.save();
            }
          }
        }
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json({ msg: `${results.length} artists processed successfully` });
      } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ msg: err.message });
      }
    });
};
