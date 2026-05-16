const Category = require('../models/Category');
const fs = require('fs');
const csv = require('csv-parser');

exports.getCategories = async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.type) {
      if (req.query.type === 'product') {
        // Find categories where type is 'product' OR type does not exist
        filter.$or = [{ type: 'product' }, { type: { $exists: false } }];
      } else {
        filter.type = req.query.type;
      }
    }
    
    const categories = await Category.find(filter).populate('parentCategory');
    res.json(categories);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.createCategory = async (req, res) => {
  try {
    const categoryData = { ...req.body };
    if (req.file) {
      categoryData.image = req.file.path;
    }
    if (!categoryData.parentCategory || categoryData.parentCategory === "" || categoryData.parentCategory === "null") {
      categoryData.parentCategory = null;
    }
    const newCategory = new Category(categoryData);
    const category = await newCategory.save();
    res.json(category);
  } catch (err) {
    res.status(500).send('Server error');
  }
};


exports.updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }
    
    // Robust check for empty parent category
    if (!updateData.parentCategory || updateData.parentCategory === "" || updateData.parentCategory === "null") {
      updateData.parentCategory = null;
    }
    
    console.log("Updating category with data:", updateData);
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('parentCategory');
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error during category update' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    
    await Category.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Category removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error during category deletion' });
  }
};

exports.bulkUploadCategories = async (req, res) => {
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
        // Pass 1: Create all categories (upsert style)
        for (const row of results) {
          if (!row.name) continue;
          await Category.findOneAndUpdate(
            { name: row.name.trim() },
            { 
              description: row.description, 
              displayOrder: row.displayOrder ? parseInt(row.displayOrder) : (results.indexOf(row) + 1)
            },
            { upsert: true, new: true }
          );
        }

        // Pass 2: Resolve parent relationships
        for (const row of results) {
          if (!row.name) continue;
          if (row.parent && row.parent.trim()) {
            const parent = await Category.findOne({ name: row.parent.trim() });
            if (parent) {
              await Category.findOneAndUpdate(
                { name: row.name.trim() },
                { parentCategory: parent._id }
              );
            }
          }
        }

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json({ msg: `${results.length} categories and relationships processed successfully` });
      } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error("Bulk Upload Error:", err);
        res.status(500).json({ msg: 'Error processing categories: ' + err.message });
      }
    })
    .on('error', (err) => {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ msg: 'File reading error: ' + err.message });
    });
};
