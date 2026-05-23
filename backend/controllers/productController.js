/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
const Product = require('../models/Product');
const Category = require('../models/Category');
const AttributeGroup = require('../models/AttributeGroup');
const Artist = require('../models/Artist');
const Space = require('../models/Space');
const Style = require('../models/Style');
const Collection = require('../models/Collection');
const fs = require('fs');
const csv = require('csv-parser');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isExclusive: { $ne: true }, isRental: { $ne: true } })
      .populate('category')
      .populate('subCategory')
      .populate('nestedCategory')
      .populate('attributes.group')
      .populate('artist')
      .populate('space')
      .populate('style')
      .populate('discoverCollection');
    console.log(`Inventory: Sending ${products.length} standard products`);
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getExclusiveProducts = async (req, res) => {
  try {
    const products = await Product.find({ isExclusive: true, isRental: { $ne: true } })
      .populate('category')
      .populate('subCategory')
      .populate('nestedCategory')
      .populate('attributes.group')
      .populate('artist')
      .populate('space')
      .populate('style')
      .populate('discoverCollection');
    console.log(`Exclusive: Sending ${products.length} exclusive products`);
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const mongoose = require('mongoose');
const slugifyHelper = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

exports.getProduct = async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug)
        .populate('category')
        .populate('subCategory')
        .populate('nestedCategory')
        .populate('attributes.group')
        .populate('artist')
        .populate('space')
        .populate('style')
        .populate('discoverCollection');
    }

    if (!product) {
      // Find by slugified name
      const allProducts = await Product.find()
        .populate('category')
        .populate('subCategory')
        .populate('nestedCategory')
        .populate('attributes.group')
        .populate('artist')
        .populate('space')
        .populate('style')
        .populate('discoverCollection');

      product = allProducts.find(p => slugifyHelper(p.name) === idOrSlug);
    }

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
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
    product = await Product.findById(product._id)
      .populate('category')
      .populate('subCategory')
      .populate('nestedCategory')
      .populate('attributes.group')
      .populate('artist')
      .populate('space')
      .populate('style')
      .populate('discoverCollection');
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
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true })
      .populate('category')
      .populate('subCategory')
      .populate('nestedCategory')
      .populate('attributes.group')
      .populate('artist')
      .populate('space')
      .populate('style')
      .populate('discoverCollection');
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
  const seenHeaders = new Map();
  fs.createReadStream(req.file.path)
    .pipe(csv({
      mapHeaders: ({ header }) => {
        const clean = String(header || '').trim();
        const count = seenHeaders.get(clean) || 0;
        seenHeaders.set(clean, count + 1);
        return count === 0 ? clean : `${clean}__${count + 1}`;
      }
    }))
    .on('data', (data) => {
      // Normalize row keys to lowercase for easier matching
      const normalizedRow = {};
      normalizedRow._canon = {};
      Object.keys(data).forEach(key => {
        const lowered = key.trim().toLowerCase();
        normalizedRow[lowered] = data[key];
        const canon = lowered.replace(/[^a-z0-9]/g, '');
        normalizedRow._canon[canon] = data[key];
      });
      // Store original keys too for [Attr] matching
      normalizedRow._original = data;
      results.push(normalizedRow);
    })
    .on('end', async () => {
      try {
        let successCount = 0;
        const failures = [];
        for (const row of results) {
          try {
            const canon = row._canon || {};
            const name = String(row.name || row.title || row.product || '').trim();

            const toNumber = (value) => {
              if (value === undefined || value === null) return undefined;
              const raw = String(value).trim();
              if (!raw) return undefined;
              const cleaned = raw.replace(/[^0-9.]/g, '');
              const num = parseFloat(cleaned);
              return Number.isFinite(num) ? num : undefined;
            };

            const basePriceCandidates = [
              row.baseprice,
              row.price,
              canon.mrpprice,
              row.mrp,
              canon.price2
            ];
            const basePriceValue = basePriceCandidates.map(toNumber).find(v => v !== undefined);

            if (!name) throw new Error('Missing Name');
            if (basePriceValue === undefined) throw new Error('Missing MRP Price / Price');

            const categoryTypeFilter = { $or: [{ type: 'product' }, { type: { $exists: false } }] };

            const subCatName = String(row.subcategory || row.sub_category || '').trim();
            const nestedCatName = String(row.nestedcategory || row.nested_category || '').trim();
            const catName = String(row.category || '').trim();

            let catDoc = null;
            let subCatDoc = null;
            let nestedCatDoc = null;

            if (catName) {
              catDoc = await Category.findOne({ ...categoryTypeFilter, name: { $regex: new RegExp(`^${catName}$`, 'i') }, parentCategory: null });
              if (!catDoc) {
                catDoc = new Category({ name: catName, parentCategory: null, type: 'product' });
                await catDoc.save();
              }
            }

            if (subCatName) {
              subCatDoc = await Category.findOne({
                ...categoryTypeFilter,
                name: { $regex: new RegExp(`^${subCatName}$`, 'i') },
                parentCategory: catDoc ? catDoc._id : { $ne: null }
              });
              if (!subCatDoc) {
                subCatDoc = new Category({
                  name: subCatName,
                  parentCategory: catDoc ? catDoc._id : null,
                  type: 'product'
                });
                await subCatDoc.save();
              }
            }

            if (nestedCatName) {
              nestedCatDoc = await Category.findOne({
                ...categoryTypeFilter,
                name: { $regex: new RegExp(`^${nestedCatName}$`, 'i') },
                parentCategory: subCatDoc ? subCatDoc._id : { $ne: null }
              });
              if (!nestedCatDoc) {
                nestedCatDoc = new Category({
                  name: nestedCatName,
                  parentCategory: subCatDoc ? subCatDoc._id : null,
                  type: 'product'
                });
                await nestedCatDoc.save();
              }
            }

            if (!catDoc && subCatDoc) {
              if (subCatDoc.parentCategory) {
                catDoc = await Category.findById(subCatDoc.parentCategory);
              } else {
                catDoc = subCatDoc;
                subCatDoc = null;
              }
            }
            if (!subCatDoc && nestedCatDoc?.parentCategory) {
              subCatDoc = await Category.findById(nestedCatDoc.parentCategory);
            }
            if (!catDoc && subCatDoc?.parentCategory) {
              catDoc = await Category.findById(subCatDoc.parentCategory);
            }

            if (!catDoc) throw new Error('Missing Category / SubCategory');

            const spaceName = String(row.space || row.room || '').trim();
            let spaceDoc = null;
            if (spaceName) {
              spaceDoc = await Space.findOne({ name: { $regex: new RegExp(`^${spaceName}$`, 'i') } });
              if (!spaceDoc) {
                spaceDoc = new Space({ name: spaceName });
                await spaceDoc.save();
              }
            }

            const styleName = String(row.style || '').trim();
            let styleDoc = null;
            if (styleName) {
              styleDoc = await Style.findOne({ name: { $regex: new RegExp(`^${styleName}$`, 'i') } });
              if (!styleDoc) {
                styleDoc = new Style({ name: styleName });
                await styleDoc.save();
              }
            }

            const collectionName = String(row.collection || row.discover_art || row.discover_collection || '').trim();
            let collectionDoc = null;
            if (collectionName) {
              collectionDoc = await Collection.findOne({ name: { $regex: new RegExp(`^${collectionName}$`, 'i') } });
              if (!collectionDoc) {
                collectionDoc = new Collection({ name: collectionName });
                await collectionDoc.save();
              }
            }

            const artistName = String(row.artist || row.creator || '').trim();
            const artistDoc = artistName
              ? await Artist.findOne({ name: { $regex: new RegExp(`^${artistName}$`, 'i') } })
              : null;

            const images = row.images ? String(row.images).split('|').map(u => u.trim()).filter(Boolean) : [];

            let attributes = [];
            for (const key of Object.keys(row._original || {})) {
              const cleanKey = key.trim();
              if (/^\[attr\]/i.test(cleanKey)) {
                const groupName = cleanKey.replace(/^\[attr\]/i, '').trim();
                const varsStr = row._original[key];
                if (varsStr?.trim()) {
                  const attrGroup = await AttributeGroup.findOne({
                    name: { $regex: new RegExp(`^${groupName}$`, 'i') }
                  });
                  if (attrGroup) {
                    const vars = String(varsStr).split('|').map(v => v.trim()).filter(Boolean);
                    attributes.push({ group: attrGroup._id, variations: vars });
                  }
                }
              }
            }

            const sku = String(row.sku || '').trim() || undefined;
            const mrpPrice = toNumber(canon.mrpprice);

            const productData = {
              name,
              description: row.description || '',
              basePrice: basePriceValue,
              compareAtPrice: (row.compareatprice || row.sale_price) ? toNumber(row.compareatprice || row.sale_price) : undefined,
              sku,
              inventory: parseInt(row.inventory || row.stock || 0),
              category: catDoc._id,
              subCategory: subCatDoc?._id || null,
              nestedCategory: nestedCatDoc?._id || null,
              space: spaceDoc?._id,
              style: styleDoc?._id,
              discoverCollection: collectionDoc?._id,
              displayOrder: parseInt(row.displayorder || row.order || 0),
              isExclusive: (() => {
                const rawVal = row.isexclusive || row.is_exclusive || row.exclusive;
                const val = String(rawVal || '').toLowerCase().trim();
                return val === 'true' || val === '1' || val === 'y' || val === 'yes';
              })(),
              isCustomizationAvailable: (() => {
                const val = String(row.iscustomizationavailable || row.is_customization || '').toLowerCase().trim();
                if (val === '') return true;
                return val !== 'false' && val !== '0' && val !== 'n' && val !== 'no';
              })(),
              images,
              attributes,
              artist: artistDoc?._id,

              hsnCode: String(canon.hsncode || '').trim() || undefined,
              gst: String(canon.gst || '').trim() || undefined,
              specifications: row.specifications || undefined,
              width: row.width || undefined,
              height: row.height || undefined,
              depth: row.depth || undefined,
              framing: row.framing || undefined,
              year: row.year || undefined,
              edition: row.edition || undefined,
              provenance: row.provenance || undefined,
              medium: row.medium || undefined,
              blogId: String(canon.blogid || '').trim() || undefined,
              dispatchWithin: String(canon.dispatchwithin || '').trim() || undefined,
              mrpPrice,
              mrpDiscount: String(canon.mrpdiscount || '').trim() || undefined,
              corporateDiscount: String(canon.corporatediscount || '').trim() || undefined,
              architectDiscount: String(canon.architectdiscount || '').trim() || undefined
            };

            const created = await new Product(productData).save();
            successCount++;
          } catch (err) {
            const name = String(row.name || row.title || row.product || '').trim();
            const sku = String(row.sku || '').trim();
            let msg = err?.message || 'Unknown error';
            if (err?.code === 11000) {
              msg = `Duplicate key: ${Object.keys(err.keyValue || {}).map(k => `${k}=${err.keyValue[k]}`).join(', ') || 'duplicate'}`;
            }
            failures.push({
              name: name || undefined,
              sku: sku || undefined,
              error: msg
            });
          }
        }
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json({
          msg: `${successCount} out of ${results.length} products processed successfully`,
          total: results.length,
          successCount,
          failureCount: failures.length,
          failures
        });
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
      'Category',
      'SubCategory',
      'NestedCategory',
      'Space',
      'Style',
      'Collection',
      'Artist',
      'SKU',
      'Inventory',
      'DisplayOrder',
      'IsExclusive',
      'IsCustomizationAvailable',
      'Images',
    ];

    // Add dynamic Attribute Headers
    attributeGroups.forEach(group => {
      headers.push(`[Attr] ${group.name}`);
    });

    headers = headers.concat([
      'HSNCode',
      'GST',
      'Specifications',
      'Width',
      'Height',
      'Depth',
      'Framing',
      'Year',
      'Edition',
      'Provenance',
      'Medium',
      'BlogId',
      'Dispatch within:',
      'MRP Price',
      'MRP Discount',
      'Corporate Discount',
      'Architect Discount'
    ]);

    // Create a robust example row
    const exampleData = {
      'Name': 'Premium Business Cards',
      'Description': 'High quality matte finish cards',
      'Category': 'Business Cards',
      'SubCategory': 'Premium Cards',
      'NestedCategory': 'Textured Cards',
      'Space': 'Living Room',
      'Style': 'Modern Luxury',
      'Collection': 'New Arrivals',
      'Artist': 'Pablo Picasso',
      'SKU': 'BC-001',
      'Inventory': '100',
      'DisplayOrder': '1',
      'IsExclusive': 'false',
      'IsCustomizationAvailable': 'true',
      'Images': 'https://example.com/img1.jpg|https://example.com/img2.jpg',
      'HSNCode': '4411',
      'GST': '5%',
      'Specifications': 'Archival paper + archival inks',
      'Width': '300 mm - 11.81 inches',
      'Height': '450 mm - 17.72 inches',
      'Depth': '',
      'Framing': 'With Framing',
      'Year': '1890 c.',
      'Edition': 'Edition Size 300',
      'Provenance': 'Private collection',
      'Medium': 'Photograph',
      'BlogId': '42',
      'Dispatch within:': '24 hours',
      'MRP Price': '4999',
      'MRP Discount': '',
      'Corporate Discount': '10%',
      'Architect Discount': '20%'
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

exports.getRentalProducts = async (req, res) => {
  try {
    const products = await Product.find({ isRental: true })
      .populate('category')
      .populate('subCategory')
      .populate('nestedCategory')
      .populate('artist')
      .populate('space')
      .populate('style')
      .populate('discoverCollection');
    console.log(`Rentals: Sending ${products.length} rental products`);
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getRentalTemplate = async (req, res) => {
  try {
    const headers = [
      'Name',
      'Description',
      'Price',
      'CompareAtPrice',
      'Category',
      'SubCategory',
      'NestedCategory',
      'Space',
      'Style',
      'Collection',
      'Artist',
      'SKU',
      'Inventory',
      'DisplayOrder',
      'RentalDepositPercent',
      'RentalPrice3M',
      'RentalPrice6M',
      'RentalPrice9M',
      'FixedSize',
      'FixedFrame',
      'FixedFrameColor',
      'FixedMount',
      'FixedMountColor',
      'FixedGlaze',
      'Images'
    ];

    const exampleData = {
      'Name': 'Sunlit Meadows Landscape (Rental)',
      'Description': 'Exclusive landscape oil painting print for monthly rental.',
      'Price': '25000',
      'CompareAtPrice': '30000',
      'Category': 'Art Prints',
      'SubCategory': 'Heritage Landscapes',
      'NestedCategory': 'Temple Series',
      'Space': 'Living Room',
      'Style': 'Quiet Luxury',
      'Collection': 'Best Sellers',
      'Artist': 'Raja Ravi Varma',
      'SKU': 'RENT-SML-001',
      'Inventory': '5',
      'DisplayOrder': '1',
      'RentalDepositPercent': '20',
      'RentalPrice3M': '1250',
      'RentalPrice6M': '1000',
      'RentalPrice9M': '850',
      'FixedSize': 'A3',
      'FixedFrame': 'Box Frame',
      'FixedFrameColor': 'Black',
      'FixedMount': 'Single Mount',
      'FixedMountColor': 'Off White',
      'FixedGlaze': 'Premium Glass',
      'Images': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
    };

    const headerLine = headers.join(',');
    const exampleLine = headers.map(h => `"${exampleData[h] || ''}"`).join(',');
    const csvContent = headerLine + '\n' + exampleLine;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=rental_product_template.csv');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error("Rental Template Error:", err);
    res.status(500).json({ msg: 'Error generating rental template' });
  }
};

exports.bulkUploadRentalProducts = async (req, res) => {
  console.log('--- Bulk Rental Upload Started ---');
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  const results = [];
  const seenHeaders = new Map();
  fs.createReadStream(req.file.path)
    .pipe(csv({
      mapHeaders: ({ header }) => {
        const clean = String(header || '').trim();
        const count = seenHeaders.get(clean) || 0;
        seenHeaders.set(clean, count + 1);
        return count === 0 ? clean : `${clean}__${count + 1}`;
      }
    }))
    .on('data', (data) => {
      const normalizedRow = {};
      normalizedRow._canon = {};
      Object.keys(data).forEach(key => {
        const lowered = key.trim().toLowerCase();
        normalizedRow[lowered] = data[key];
        const canon = lowered.replace(/[^a-z0-9]/g, '');
        normalizedRow._canon[canon] = data[key];
      });
      results.push(normalizedRow);
    })
    .on('end', async () => {
      try {
        let successCount = 0;
        for (const row of results) {
          const canon = row._canon || {};
          const name = row.name || row.title || row.product;
          const toNumber = (value) => {
            if (value === undefined || value === null) return undefined;
            const raw = String(value).trim();
            if (!raw) return undefined;
            const cleaned = raw.replace(/[^0-9.]/g, '');
            const num = parseFloat(cleaned);
            return Number.isFinite(num) ? num : undefined;
          };

          const basePriceCandidates = [
            row.baseprice,
            row.price,
            canon.mrpprice,
            row.mrp,
            canon.price2
          ];

          const basePriceValue = basePriceCandidates.map(toNumber).find(v => v !== undefined);

          if (!name || basePriceValue === undefined) continue;

          const categoryTypeFilter = { $or: [{ type: 'product' }, { type: { $exists: false } }] };

          // Find or Create Category, SubCategory, NestedCategory
          const subCatName = row.subcategory || row.sub_category;
          const nestedCatName = row.nestedcategory || row.nested_category;
          const catName = row.category;

          let catDoc = null;
          let subCatDoc = null;
          let nestedCatDoc = null;

          if (catName?.trim()) {
            catDoc = await Category.findOne({ ...categoryTypeFilter, name: { $regex: new RegExp(`^${catName.trim()}$`, 'i') }, parentCategory: null });
            if (!catDoc) {
              catDoc = new Category({ name: catName.trim(), parentCategory: null, type: 'product' });
              await catDoc.save();
            }
          }

          if (subCatName?.trim()) {
            subCatDoc = await Category.findOne({ 
              ...categoryTypeFilter,
              name: { $regex: new RegExp(`^${subCatName.trim()}$`, 'i') },
              parentCategory: catDoc ? catDoc._id : { $ne: null }
            });
            if (!subCatDoc) {
              subCatDoc = new Category({ 
                name: subCatName.trim(), 
                parentCategory: catDoc ? catDoc._id : null,
                type: 'product'
              });
              await subCatDoc.save();
            }
          }

          if (nestedCatName?.trim()) {
            nestedCatDoc = await Category.findOne({
              ...categoryTypeFilter,
              name: { $regex: new RegExp(`^${nestedCatName.trim()}$`, 'i') },
              parentCategory: subCatDoc ? subCatDoc._id : { $ne: null }
            });
            if (!nestedCatDoc) {
              nestedCatDoc = new Category({
                name: nestedCatName.trim(),
                parentCategory: subCatDoc ? subCatDoc._id : null,
                type: 'product'
              });
              await nestedCatDoc.save();
            }
          }

          if (!catDoc && subCatDoc) {
            if (subCatDoc.parentCategory) {
              catDoc = await Category.findById(subCatDoc.parentCategory);
            } else {
              catDoc = subCatDoc;
              subCatDoc = null;
            }
          }

          if (!subCatDoc && nestedCatDoc) {
            if (nestedCatDoc.parentCategory) {
              subCatDoc = await Category.findById(nestedCatDoc.parentCategory);
            }
          }
          if (!catDoc && subCatDoc?.parentCategory) {
            catDoc = await Category.findById(subCatDoc.parentCategory);
          }
          
          if (!catDoc) continue;

          // Space, Style, Collection, Artist
          const spaceName = row.space || row.room;
          let spaceDoc = null;
          if (spaceName?.trim()) {
            spaceDoc = await Space.findOne({ name: { $regex: new RegExp(`^${spaceName.trim()}$`, 'i') } });
            if (!spaceDoc) {
              spaceDoc = new Space({ name: spaceName.trim() });
              await spaceDoc.save();
            }
          }

          const styleName = row.style;
          let styleDoc = null;
          if (styleName?.trim()) {
            styleDoc = await Style.findOne({ name: { $regex: new RegExp(`^${styleName.trim()}$`, 'i') } });
            if (!styleDoc) {
              styleDoc = new Style({ name: styleName.trim() });
              await styleDoc.save();
            }
          }

          const collectionName = row.collection || row.discover_art || row.discover_collection;
          let collectionDoc = null;
          if (collectionName?.trim()) {
            collectionDoc = await Collection.findOne({ name: { $regex: new RegExp(`^${collectionName.trim()}$`, 'i') } });
            if (!collectionDoc) {
              collectionDoc = new Collection({ name: collectionName.trim() });
              await collectionDoc.save();
            }
          }

          const artistName = row.artist || row.creator;
          const artistDoc = artistName?.trim() 
            ? await Artist.findOne({ name: { $regex: new RegExp(`^${artistName.trim()}$`, 'i') } })
            : null;

          const images = row.images ? row.images.split('|').map(u => u.trim()).filter(Boolean) : [];
          
          const sku = row.sku?.trim();
          const filter = sku ? { sku } : { name: name.trim() };

          await Product.findOneAndUpdate(filter, {
            name: name.trim(),
            description: row.description || '',
            basePrice: basePriceValue,
            compareAtPrice: (row.compareatprice || row.sale_price) ? toNumber(row.compareatprice || row.sale_price) : undefined,
            sku: sku || undefined,
            inventory: parseInt(row.inventory || row.stock || 0),
            category: catDoc._id,
            subCategory: subCatDoc?._id || null,
            nestedCategory: nestedCatDoc?._id || null,
            space: spaceDoc?._id,
            style: styleDoc?._id,
            discoverCollection: collectionDoc?._id,
            displayOrder: parseInt(row.displayorder || row.order || 0),
            isExclusive: false,
            isCustomizationAvailable: false,
            isRental: true,
            rentalDepositPercent: row.rentaldepositpercent ? parseFloat(row.rentaldepositpercent) : 20,
            rentalPrice3M: row.rentalprice3m ? parseFloat(row.rentalprice3m) : undefined,
            rentalPrice6M: row.rentalprice6m ? parseFloat(row.rentalprice6m) : undefined,
            rentalPrice9M: row.rentalprice9m ? parseFloat(row.rentalprice9m) : undefined,
            fixedSize: row.fixedsize || '',
            fixedFrame: row.fixedframe || '',
            fixedFrameColor: row.fixedframecolor || '',
            fixedMount: row.fixedmount || '',
            fixedMountColor: row.fixedmountcolor || '',
            fixedGlaze: row.fixedglaze || '',
            images,
            artist: artistDoc?._id
          }, { upsert: true, new: true, setDefaultsOnInsert: true });
          successCount++;
        }
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json({ msg: `${successCount} out of ${results.length} rental products processed successfully` });
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
