const Product = require('../models/Product');
const Category = require('../models/Category');
const AttributeGroup = require('../models/AttributeGroup');
const Artist = require('../models/Artist');
const fs = require('fs');
const csv = require('csv-parser');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isExclusive: { $ne: true } })
      .populate('category')
      .populate('attributes.group')
      .populate('artist');
    console.log(`Inventory: Sending ${products.length} standard products`);
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getExclusiveProducts = async (req, res) => {
  try {
    const products = await Product.find({ isExclusive: true })
      .populate('category')
      .populate('attributes.group')
      .populate('artist');
    console.log(`Exclusive: Sending ${products.length} exclusive products`);
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    const fileUrls = (req.files || []).map(f => f.path);
    let existingImages = [];
    if (data.existingImages) {
      existingImages = typeof data.existingImages === 'string' ? JSON.parse(data.existingImages) : data.existingImages;
      delete data.existingImages;
    }
    data.images = [...existingImages, ...fileUrls];
    if (typeof data.attributes === 'string') data.attributes = JSON.parse(data.attributes);
    const newProduct = new Product(data);
    let product = await newProduct.save();
    product = await Product.findById(product._id).populate('category').populate('attributes.group').populate('artist');
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    const fileUrls = (req.files || []).map(f => f.path);
    let existingImages = [];
    if (data.existingImages) {
      existingImages = typeof data.existingImages === 'string' ? JSON.parse(data.existingImages) : data.existingImages;
      delete data.existingImages;
    }

    // Handle images
    let urlImages = [];
    if (data.urlImages) {
      urlImages = typeof data.urlImages === 'string' ? [data.urlImages] : data.urlImages;
      delete data.urlImages;
    }

    const newImages = [...fileUrls, ...urlImages];

    // Always update images if existingImages is provided (even if empty) or if new images exist
    if (req.body.existingImages || newImages.length > 0) {
      data.images = [...existingImages, ...newImages];
    }
    
    delete data.clearImages;
    if (typeof data.attributes === 'string') data.attributes = JSON.parse(data.attributes);
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true }).populate('category').populate('attributes.group').populate('artist');
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Product removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.bulkUploadProducts = async (req, res) => {
  console.log('--- Bulk Upload Started ---');
  if (!req.file) {
    console.log('No file in request');
    return res.status(400).send('No file uploaded');
  }
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
    .on('data', (data) => {
      // Normalize row keys to lowercase for easier matching
      const normalizedRow = {};
      Object.keys(data).forEach(key => {
        normalizedRow[key.trim().toLowerCase()] = data[key];
      });
      // Store original keys too for [Attr] matching
      normalizedRow._original = data;
      results.push(normalizedRow);
    })
    .on('end', async () => {
      try {
        let successCount = 0;
        for (const row of results) {
          const name = row.name || row.title || row.product;
          const basePrice = row.baseprice || row.price || row.mrp;
          
          if (!name || !basePrice) continue;

          // Find or Create Category
          const subCatName = row.subcategory || row.sub_category;
          const catName = row.category;

          let catDoc = null;
          if (subCatName?.trim()) {
            catDoc = await Category.findOne({ name: { $regex: new RegExp(`^${subCatName.trim()}$`, 'i') } });
            if (!catDoc) {
              catDoc = new Category({ name: subCatName.trim() });
              await catDoc.save();
              console.log(`Bulk Upload: Created new Category "${subCatName.trim()}"`);
            }
          } else if (catName?.trim()) {
            catDoc = await Category.findOne({ name: { $regex: new RegExp(`^${catName.trim()}$`, 'i') } });
            if (!catDoc) {
              catDoc = new Category({ name: catName.trim() });
              await catDoc.save();
              console.log(`Bulk Upload: Created new Category "${catName.trim()}"`);
            }
          }
          
          if (!catDoc) {
            console.error(`[Bulk Upload Error] Product: "${name}" - No Category or SubCategory specified.`);
            continue;
          }

          // Find Artist
          const artistName = row.artist || row.creator;
          const artistDoc = artistName?.trim() 
            ? await Artist.findOne({ name: { $regex: new RegExp(`^${artistName.trim()}$`, 'i') } })
            : null;

          const images = row.images ? row.images.split('|').map(u => u.trim()).filter(Boolean) : [];
          
          // Handle Attributes using original keys
          let attributes = [];
          console.log(`Processing product: ${name}`);
          console.log(`  All headers found: ${Object.keys(row._original).join(', ')}`);
          for (const key of Object.keys(row._original)) {
            const cleanKey = key.trim();
            if (/^\[attr\]/i.test(cleanKey)) {
              const groupName = cleanKey.replace(/^\[attr\]/i, '').trim();
              const varsStr = row._original[key];
              
              if (varsStr?.trim()) {
                console.log(`  Checking Attribute Group: "${groupName}"`);
                const attrGroup = await AttributeGroup.findOne({ 
                  name: { $regex: new RegExp(`^${groupName}$`, 'i') } 
                });

                if (attrGroup) {
                  const vars = varsStr.split('|').map(v => v.trim()).filter(Boolean);
                  console.log(`    Found Group! Adding ${vars.length} variations: ${vars.join(', ')}`);
                  attributes.push({
                    group: attrGroup._id,
                    variations: vars
                  });
                } else {
                  console.log(`    SKIPPED: Group "${groupName}" not found in DB.`);
                }
              }
            }
          }
          console.log(`Final attributes for ${name}:`, JSON.stringify(attributes));

          const sku = row.sku?.trim();
          const filter = sku ? { sku } : { name: name.trim() };
          
          await Product.findOneAndUpdate(filter, {
            name: name.trim(),
            description: row.description || '',
            basePrice: parseFloat(basePrice),
            compareAtPrice: (row.compareatprice || row.sale_price) ? parseFloat(row.compareatprice || row.sale_price) : undefined,
            sku: sku || undefined,
            inventory: parseInt(row.inventory || row.stock || 0),
            category: catDoc._id,
            displayOrder: parseInt(row.displayorder || row.order || 0),
            isFeatured: (() => {
              const val = String(row.isfeatured || row.is_featured || '').toLowerCase().trim();
              return val === 'true' || val === '1' || val === 'y' || val === 'yes';
            })(),
            isExclusive: (() => {
              const rawVal = row.isexclusive || row.is_exclusive || row.exclusive;
              const val = String(rawVal || '').toLowerCase().trim();
              console.log(`[DEBUG] Product "${name}" raw isExclusive: "${rawVal}", parsed: ${val === 'true' || val === '1' || val === 'y' || val === 'yes'}`);
              return val === 'true' || val === '1' || val === 'y' || val === 'yes';
            })(),
            isCustomizationAvailable: (() => {
              const val = String(row.iscustomizationavailable || row.is_customization || '').toLowerCase().trim();
              if (val === '') return true; // Default
              return val !== 'false' && val !== '0' && val !== 'n' && val !== 'no';
            })(),
            images,
            attributes,
            artist: artistDoc?._id
          }, { upsert: true, new: true, setDefaultsOnInsert: true });
          successCount++;
        }
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json({ msg: `${successCount} out of ${results.length} products processed successfully` });
      } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ msg: 'Error: ' + err.message });
      }
    })
    .on('error', (err) => {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ msg: 'File reading error: ' + err.message });
    });
};

exports.getTemplate = async (req, res) => {
  try {
    const attributeGroups = await AttributeGroup.find();
    
    // Base Headers
    let headers = [
      'Name',
      'Description',
      'Price',
      'CompareAtPrice',
      'Category',
      'SubCategory',
      'Artist',
      'SKU',
      'Inventory',
      'DisplayOrder',
      'IsFeatured',
      'IsExclusive',
      'IsCustomizationAvailable',
      'Images'
    ];

    // Add dynamic Attribute Headers
    attributeGroups.forEach(group => {
      headers.push(`[Attr] ${group.name}`);
    });

    // Create a robust example row
    const exampleData = {
      'Name': 'Premium Business Cards',
      'Description': 'High quality matte finish cards',
      'Price': '499',
      'CompareAtPrice': '599',
      'Category': 'Business Cards',
      'SubCategory': 'Premium Cards',
      'Artist': 'Pablo Picasso',
      'SKU': 'BC-001',
      'Inventory': '100',
      'DisplayOrder': '1',
      'IsFeatured': 'true',
      'IsExclusive': 'false',
      'IsCustomizationAvailable': 'true',
      'Images': 'https://example.com/img1.jpg|https://example.com/img2.jpg'
    };

    // Add dynamic attributes to example
    attributeGroups.forEach(g => {
      exampleData[`[Attr] ${g.name}`] = g.variations.map(v => v.name).slice(0, 2).join('|');
    });

    const headerLine = headers.join(',');
    const exampleLine = headers.map(h => `"${exampleData[h] || ''}"`).join(',');
    const csvContent = headerLine + '\n' + exampleLine;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=product_template.csv');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error("Template Error:", err);
    res.status(500).json({ msg: 'Error generating template' });
  }
};
