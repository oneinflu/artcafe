const Style = require('../models/Style');
const fs = require('fs');
const csv = require('csv-parser');

exports.getStyles = async (req, res) => {
  try {
    const styles = await Style.find().sort({ displayOrder: 1, name: 1 });
    res.json(styles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

exports.createStyle = async (req, res) => {
  try {
    const { name, description, displayOrder } = req.body;
    const newStyle = new Style({ name, description, displayOrder });
    const style = await newStyle.save();
    res.json(style);
  } catch (err) {
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

exports.updateStyle = async (req, res) => {
  try {
    const style = await Style.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!style) return res.status(404).json({ msg: 'Style not found' });
    res.json(style);
  } catch (err) {
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

exports.deleteStyle = async (req, res) => {
  try {
    const style = await Style.findById(req.params.id);
    if (!style) return res.status(404).json({ msg: 'Style not found' });
    await Style.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Style removed successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

exports.bulkUploadStyles = async (req, res) => {
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
          await Style.findOneAndUpdate(
            { name: row.name.trim() },
            { 
              description: row.description, 
              displayOrder: row.displayOrder ? parseInt(row.displayOrder) : (results.indexOf(row) + 1)
            },
            { upsert: true, new: true }
          );
        }

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json({ msg: `${results.length} styles processed successfully` });
      } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ msg: 'Error processing styles: ' + err.message });
      }
    })
    .on('error', (err) => {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ msg: 'File reading error: ' + err.message });
    });
};
