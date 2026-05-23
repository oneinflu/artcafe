const Category = require('../models/Category');
const fs = require('fs');
const csv = require('csv-parser');

const nextCategoryCodeNumber = async (type) => {
  const docs = await Category.find({ type, codeNumber: { $exists: true, $ne: null } }, { codeNumber: 1 });
  let max = 1000;
  docs.forEach(d => {
    const n = parseInt(String(d.codeNumber).trim(), 10);
    if (Number.isFinite(n) && n > max) max = n;
  });
  return String(max + 1);
};

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
    if (categoryData.codeNumber !== undefined && categoryData.codeNumber !== null) {
      const v = String(categoryData.codeNumber).trim();
      categoryData.codeNumber = v ? v : undefined;
    }
    if (!categoryData.codeNumber) {
      categoryData.codeNumber = await nextCategoryCodeNumber(categoryData.type === 'blog' ? 'blog' : 'product');
    }
    if (!categoryData.displayOrder || String(categoryData.displayOrder).trim() === '') {
      const n = parseInt(String(categoryData.codeNumber).trim(), 10);
      categoryData.displayOrder = Number.isFinite(n) ? n : 0;
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
    if (updateData.codeNumber !== undefined && updateData.codeNumber !== null) {
      const v = String(updateData.codeNumber).trim();
      updateData.codeNumber = v ? v : undefined;
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
    const idsToDelete = [category._id];
    for (let i = 0; i < idsToDelete.length; i++) {
      const children = await Category.find({ parentCategory: idsToDelete[i] }, { _id: 1 });
      children.forEach(c => idsToDelete.push(c._id));
    }
    const result = await Category.deleteMany({ _id: { $in: idsToDelete } });
    res.json({ msg: `Removed ${result.deletedCount} categories` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error during category deletion' });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const queue = ids.map(String).filter(Boolean);
    const idsToDelete = [];
    const seen = new Set();

    while (queue.length) {
      const id = queue.shift();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      idsToDelete.push(id);
      const children = await Category.find({ parentCategory: id }, { _id: 1 });
      children.forEach(c => queue.push(String(c._id)));
    }

    const result = await Category.deleteMany({ _id: { $in: idsToDelete } });
    res.json({ msg: `Removed ${result.deletedCount} categories` });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.bulkUploadCategories = async (req, res) => {
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
      const normalized = {};
      normalized._canon = {};
      Object.keys(data).forEach(key => {
        const lowered = key.trim().toLowerCase();
        normalized[lowered] = data[key];
        const canon = lowered.replace(/[^a-z0-9]/g, '');
        normalized._canon[canon] = data[key];
      });
      results.push(normalized);
    })
    .on('end', async () => {
      try {
        const typeFromQuery = req.query.type;

        const normalizeType = (value) => {
          const raw = String(value || '').toLowerCase().trim();
          if (raw === 'blog') return 'blog';
          return 'product';
        };

        const normalizeLevel = (value) => {
          const raw = String(value || '').toLowerCase().trim();
          if (raw === 'nested' || raw === 'sub' || raw === 'root') return raw;
          return '';
        };

        const toInt = (value) => {
          if (value === undefined || value === null) return undefined;
          const raw = String(value).trim();
          if (!raw) return undefined;
          const num = parseInt(raw, 10);
          return Number.isFinite(num) ? num : undefined;
        };

        const resolveType = (row) => {
          if (typeFromQuery) return normalizeType(typeFromQuery);
          const canon = row._canon || {};
          return normalizeType(canon.type);
        };

        const normalizeCode = (value) => {
          const raw = String(value || '').trim();
          return raw ? raw : undefined;
        };

        const findByNameOrCode = async ({ type, value, parentId }) => {
          const v = String(value || '').trim();
          if (!v) return null;
          const byCode = await Category.findOne({ type, codeNumber: v });
          if (byCode) return byCode;
          if (parentId !== undefined) {
            const byNameAndParent = await Category.findOne({
              type,
              name: { $regex: new RegExp(`^${v}$`, 'i') },
              parentCategory: parentId
            });
            if (byNameAndParent) return byNameAndParent;
          }
          return Category.findOne({ type, name: { $regex: new RegExp(`^${v}$`, 'i') } });
        };

        const upsertCategory = async ({ type, name, codeNumber, parentId, description, displayOrder }) => {
          const filter = codeNumber
            ? { type, codeNumber }
            : { type, name, parentCategory: parentId ?? null };
          const update = {
            name,
            type,
            parentCategory: parentId ?? null,
            description: description || '',
            displayOrder: displayOrder ?? 0
          };
          if (codeNumber) update.codeNumber = codeNumber;
          return Category.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
        };

        const levelOrder = { root: 0, sub: 1, nested: 2 };
        const nextCodes = {
          product: parseInt(await nextCategoryCodeNumber('product'), 10),
          blog: parseInt(await nextCategoryCodeNumber('blog'), 10)
        };
        const rowsSorted = results
          .map((r, idx) => ({ r, idx }))
          .sort((a, b) => {
            const la = normalizeLevel(a.r._canon?.level) || 'root';
            const lb = normalizeLevel(b.r._canon?.level) || 'root';
            return (levelOrder[la] ?? 0) - (levelOrder[lb] ?? 0);
          });

        for (const { r: row, idx } of rowsSorted) {
          const canon = row._canon || {};
          const type = resolveType(row);
          const name = String(row.name || '').trim();
          if (!name) continue;

          let codeNumber = normalizeCode(row.codenumber ?? row.code ?? canon.codenumber ?? canon.code);
          if (!codeNumber) {
            const candidate = nextCodes[type];
            nextCodes[type] = candidate + 1;
            codeNumber = String(candidate);
          }
          const displayOrder = toInt(row.displayorder ?? row.display_order ?? canon.displayorder) ?? parseInt(codeNumber, 10) ?? (idx + 1);
          const description = row.description || '';
          const level = normalizeLevel(canon.level) || 'root';

          const parentDirect = String(row.parent || canon.parent || '').trim();
          const rootRef = String(canon.rootcategory || '').trim();
          const subRef = String(canon.subcategory || '').trim();

          let parentId = null;

          if (parentDirect) {
            const parent = await findByNameOrCode({ type, value: parentDirect });
            if (parent) parentId = parent._id;
          } else if (level === 'sub') {
            const rootName = rootRef;
            if (rootName) {
              const root = await findByNameOrCode({ type, value: rootName, parentId: null });
              if (root) parentId = root._id;
              if (!root) {
                const createdRoot = await upsertCategory({
                  type,
                  name: rootName,
                  codeNumber: undefined,
                  parentId: null,
                  description: '',
                  displayOrder: 0
                });
                parentId = createdRoot._id;
              }
            }
          } else if (level === 'nested') {
            const subName = subRef;
            if (subName) {
              let rootId = null;
              if (rootRef) {
                const root = await findByNameOrCode({ type, value: rootRef, parentId: null });
                if (root) rootId = root._id;
                if (!root) {
                  const createdRoot = await upsertCategory({
                    type,
                    name: rootRef,
                    codeNumber: undefined,
                    parentId: null,
                    description: '',
                    displayOrder: 0
                  });
                  rootId = createdRoot._id;
                }
              }
              const sub = await findByNameOrCode({ type, value: subName, parentId: rootId ?? undefined });
              if (sub) parentId = sub._id;
            }
          }

          await upsertCategory({ type, name, codeNumber, parentId, description, displayOrder });
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

exports.getTemplate = async (req, res) => {
  try {
    const type = (req.query.type === 'blog') ? 'blog' : 'product';
    const headers = [
      'CodeNumber',
      'Name',
      'Description',
      'Type',
      'Level',
      'RootCategory',
      'SubCategory',
      'Parent'
    ];

    const exampleRows = [
      {
        CodeNumber: '1001',
        Name: 'Art Prints',
        Description: 'All art prints',
        Type: type,
        Level: 'root',
        RootCategory: '',
        SubCategory: '',
        Parent: ''
      },
      {
        CodeNumber: '1101',
        Name: 'Vintage Photograph',
        Description: 'Photography based prints',
        Type: type,
        Level: 'sub',
        RootCategory: 'Art Prints',
        SubCategory: '',
        Parent: ''
      },
      {
        CodeNumber: '1111',
        Name: 'Bombay',
        Description: 'Bombay collection',
        Type: type,
        Level: 'nested',
        RootCategory: 'Art Prints',
        SubCategory: 'Vintage Photograph',
        Parent: ''
      }
    ];

    const escape = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
    const headerLine = headers.join(',');
    const lines = exampleRows.map(row => headers.map(h => escape(row[h])).join(','));
    const csvContent = [headerLine, ...lines].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=category_template_${type}.csv`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error("Category Template Error:", err);
    res.status(500).json({ msg: 'Error generating template' });
  }
};
