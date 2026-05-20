const Collection = require('../models/Collection');
const fs = require('fs');
const csv = require('csv-parser');

// Get all collections
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find().sort({ displayOrder: 1, name: 1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Create a collection
exports.createCollection = async (req, res) => {
  try {
    const { name, description, displayOrder } = req.body;
    let collection = await Collection.findOne({ name });
    if (collection) {
      return res.status(400).json({ msg: 'Collection already exists' });
    }
    collection = new Collection({ name, description, displayOrder });
    await collection.save();
    res.json(collection);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update a collection
exports.updateCollection = async (req, res) => {
  try {
    const { name, description, displayOrder } = req.body;
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      { name, description, displayOrder },
      { new: true }
    );
    res.json(collection);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete a collection
exports.deleteCollection = async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Collection deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Bulk Upload Collections
exports.bulkUploadCollections = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'Please upload a CSV file' });
  }

  const results = [];
  const errors = [];
  let rowCount = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      rowCount++;
      results.push(data);
    })
    .on('end', async () => {
      try {
        for (const row of results) {
          const name = row.name || row.Name;
          if (!name) continue;

          const description = row.description || row.Description || '';
          const displayOrder = parseInt(row.displayOrder || row.DisplayOrder || '0', 10);

          await Collection.findOneAndUpdate(
            { name: name.trim() },
            { description: description.trim(), displayOrder },
            { upsert: true, new: true }
          );
        }

        // Clean up the uploaded temp file
        fs.unlinkSync(req.file.path);
        res.json({ msg: `Successfully processed ${rowCount} rows.` });
      } catch (err) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ msg: err.message });
      }
    })
    .on('error', (err) => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ msg: err.message });
    });
};

// Get CSV Template
exports.getTemplate = (req, res) => {
  const headers = ['Name', 'Description', 'DisplayOrder'];
  const sampleData = [
    ['New Arrivals', 'Latest fine art print additions', '1'],
    ['Best Sellers', 'Most popular customer choices', '2'],
    ['Founder Picks', 'Specially curated by our founders', '3']
  ];

  let csvContent = headers.join(',') + '\n';
  sampleData.forEach(row => {
    csvContent += row.map(val => `"${val.replace(/"/g, '""')}"`).join(',') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=collections_template.csv');
  res.status(200).send(csvContent);
};
