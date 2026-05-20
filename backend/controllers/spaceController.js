const Space = require('../models/Space');
const fs = require('fs');
const csv = require('csv-parser');

exports.getSpaces = async (req, res) => {
  try {
    const spaces = await Space.find().sort({ displayOrder: 1, name: 1 });
    res.json(spaces);
  } catch (err) {
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

exports.createSpace = async (req, res) => {
  try {
    const { name, description, displayOrder } = req.body;
    const newSpace = new Space({ name, description, displayOrder });
    const space = await newSpace.save();
    res.json(space);
  } catch (err) {
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

exports.updateSpace = async (req, res) => {
  try {
    const space = await Space.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!space) return res.status(404).json({ msg: 'Space not found' });
    res.json(space);
  } catch (err) {
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

exports.deleteSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ msg: 'Space not found' });
    await Space.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Space removed successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

exports.bulkUploadSpaces = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv({
      mapHeaders: ({ header }) => header.trim()
    }))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        for (const row of results) {
          if (!row.name) continue;
          await Space.findOneAndUpdate(
            { name: row.name.trim() },
            { 
              description: row.description, 
              displayOrder: row.displayOrder ? parseInt(row.displayOrder) : (results.indexOf(row) + 1)
            },
            { upsert: true, new: true }
          );
        }

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json({ msg: `${results.length} spaces processed successfully` });
      } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ msg: 'Error processing spaces: ' + err.message });
      }
    })
    .on('error', (err) => {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ msg: 'File reading error: ' + err.message });
    });
};
