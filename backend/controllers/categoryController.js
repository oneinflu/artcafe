const Category = require('../models/Category');
const fs = require('fs');
const csv = require('csv-parser');

const ROOT_CODE_START = 1;

const parseCodeParts = (codeNumber) => {
  const raw = String(codeNumber || '').trim();
  if (!raw) return [];
  return raw.split('-').map(p => p.trim()).filter(Boolean);
};

const normalizeIsActive = (value) => {
  if (value === undefined || value === null) return true;
  const raw = String(value).toLowerCase().trim();
  if (!raw) return true;
  return raw !== 'false' && raw !== '0' && raw !== 'no' && raw !== 'n';
};

const nextRootCodeNumber = async (type) => {
  const roots = await Category.find({ type, parentCategory: null, codeNumber: { $exists: true, $ne: null } }, { codeNumber: 1 });
  let max = ROOT_CODE_START - 1;
  roots.forEach(r => {
    const parts = parseCodeParts(r.codeNumber);
    if (parts.length !== 1) return;
    const n = parseInt(parts[0], 10);
    if (Number.isFinite(n) && n >= ROOT_CODE_START && n > max) max = n;
  });
  return String(max + 1);
};

const nextChildCodeNumber = async (parentCategoryId, parentCodeNumber) => {
  const prefix = String(parentCodeNumber || '').trim();
  if (!prefix) return null;
  const children = await Category.find(
    { parentCategory: parentCategoryId, codeNumber: { $exists: true, $ne: null } },
    { codeNumber: 1 }
  );
  let maxSuffix = 0;
  children.forEach(c => {
    const parts = parseCodeParts(c.codeNumber);
    const childPrefix = parts.slice(0, -1).join('-');
    if (childPrefix !== prefix) return;
    const last = parts[parts.length - 1];
    const n = parseInt(last, 10);
    if (Number.isFinite(n) && n > maxSuffix) maxSuffix = n;
  });
  return `${prefix}-${maxSuffix + 1}`;
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
    
    const includeInactive = String(req.query.includeInactive || '').toLowerCase() === 'true';
    if (!includeInactive) filter.isActive = { $ne: false };
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
    if (!categoryData.parentCategory || categoryData.parentCategory === "" || categoryData.parentCategory === "null") {
      categoryData.parentCategory = null;
    }
    if (categoryData.isActive !== undefined) {
      const v = String(categoryData.isActive).toLowerCase().trim();
      categoryData.isActive = v !== 'false' && v !== '0' && v !== 'no' && v !== 'n';
    }

    const type = categoryData.type === 'blog' ? 'blog' : 'product';
    categoryData.type = type;

    const ensureCategoryHasCode = async (doc) => {
      if (!doc || doc.codeNumber) return doc;
      if (!doc.parentCategory) {
        doc.codeNumber = await nextRootCodeNumber(doc.type);
        doc.displayOrder = doc.displayOrder || 0;
        await doc.save();
        return doc;
      }
      const parent = await Category.findById(doc.parentCategory);
      if (parent && !parent.codeNumber) await ensureCategoryHasCode(parent);
      doc.codeNumber = await nextChildCodeNumber(doc.parentCategory, parent?.codeNumber);
      doc.displayOrder = doc.displayOrder || 0;
      await doc.save();
      return doc;
    };

    if (!categoryData.codeNumber) {
      if (!categoryData.parentCategory) {
        categoryData.codeNumber = await nextRootCodeNumber(type);
      } else {
        const parent = await Category.findById(categoryData.parentCategory);
        if (!parent) return res.status(400).json({ msg: 'Parent category not found' });
        await ensureCategoryHasCode(parent);
        categoryData.codeNumber = await nextChildCodeNumber(parent._id, parent.codeNumber);
      }
    }
    if (!categoryData.displayOrder || String(categoryData.displayOrder).trim() === '') {
      categoryData.displayOrder = 0;
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
    if (updateData.isActive !== undefined) {
      const v = String(updateData.isActive).toLowerCase().trim();
      updateData.isActive = v !== 'false' && v !== '0' && v !== 'no' && v !== 'n';
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

        const upsertCategory = async ({ type, name, codeNumber, parentId, description, displayOrder, isActive }) => {
          const filter = codeNumber
            ? { type, codeNumber }
            : { type, name, parentCategory: parentId ?? null };
          const update = {
            name,
            type,
            parentCategory: parentId ?? null,
            isActive: isActive !== undefined ? isActive : true,
            description: description || '',
            displayOrder: displayOrder ?? 0
          };
          if (codeNumber) update.codeNumber = codeNumber;
          return Category.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
        };

        const levelOrder = { root: 0, sub: 1, nested: 2 };
        const escapeRegExp = (text) => String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rootCounters = {
          product: parseInt(await nextRootCodeNumber('product'), 10),
          blog: parseInt(await nextRootCodeNumber('blog'), 10)
        };
        const childCounters = new Map(); // parentId => { prefix, nextSuffix }

        const ensureDocHasCode = async (doc) => {
          if (!doc || doc.codeNumber) return doc;
          if (!doc.parentCategory) {
            doc.codeNumber = String(rootCounters[doc.type]++);
            doc.displayOrder = doc.displayOrder || 0;
            await doc.save();
            return doc;
          }
          const parent = await Category.findById(doc.parentCategory);
          if (parent && !parent.codeNumber) await ensureDocHasCode(parent);
          doc.codeNumber = await nextChildCodeNumber(doc.parentCategory, parent?.codeNumber);
          doc.displayOrder = doc.displayOrder || 0;
          await doc.save();
          return doc;
        };

        const nextChildFromCache = async (parentDoc) => {
          const parentId = String(parentDoc?._id || '').trim();
          const prefix = String(parentDoc?.codeNumber || '').trim();
          if (!parentId || !prefix) return null;

          const existing = childCounters.get(parentId);
          if (existing && existing.prefix === prefix) {
            const code = `${prefix}-${existing.nextSuffix}`;
            existing.nextSuffix += 1;
            return code;
          }

          const children = await Category.find(
            { parentCategory: parentDoc._id, codeNumber: { $regex: new RegExp(`^${escapeRegExp(prefix)}-`) } },
            { codeNumber: 1 }
          );
          let maxSuffix = 0;
          children.forEach(c => {
            const parts = parseCodeParts(c.codeNumber);
            const childPrefix = parts.slice(0, -1).join('-');
            if (childPrefix !== prefix) return;
            const last = parts[parts.length - 1];
            const n = parseInt(last, 10);
            if (Number.isFinite(n) && n > maxSuffix) maxSuffix = n;
          });
          const entry = { prefix, nextSuffix: maxSuffix + 1 };
          childCounters.set(parentId, entry);
          const code = `${prefix}-${entry.nextSuffix}`;
          entry.nextSuffix += 1;
          return code;
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

          const description = row.description || '';
          const level = normalizeLevel(canon.level) || 'root';
          const isActive = normalizeIsActive(canon.isactive ?? row.isactive ?? row.active);

          const parentDirect = String(row.parent || canon.parent || '').trim();
          const rootRef = String(canon.rootcategory || '').trim();
          const subRef = String(canon.subcategory || '').trim();

          let parentId = null;
          let parentDoc = null;

          if (parentDirect) {
            const parent = await findByNameOrCode({ type, value: parentDirect });
            if (parent) {
              parentId = parent._id;
              parentDoc = parent;
            }
          } else if (level === 'sub') {
            const rootName = rootRef;
            if (rootName) {
              const root = await findByNameOrCode({ type, value: rootName, parentId: null });
              if (root) {
                parentId = root._id;
                parentDoc = root;
              }
              if (!root) {
                const rootCode = String(rootCounters[type]++);
                const createdRoot = await upsertCategory({
                  type,
                  name: rootName,
                  codeNumber: rootCode,
                  parentId: null,
                  isActive: true,
                  description: '',
                  displayOrder: 0
                });
                parentId = createdRoot._id;
                parentDoc = createdRoot;
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
                  const rootCode = String(rootCounters[type]++);
                  const createdRoot = await upsertCategory({
                    type,
                    name: rootRef,
                    codeNumber: rootCode,
                    parentId: null,
                    isActive: true,
                    description: '',
                    displayOrder: 0
                  });
                  rootId = createdRoot._id;
                }
              }
              const sub = await findByNameOrCode({ type, value: subName, parentId: rootId ?? undefined });
              if (sub) {
                parentId = sub._id;
                parentDoc = sub;
              }
            }
          }

          let codeNumber = normalizeCode(row.codenumber ?? row.code ?? canon.codenumber ?? canon.code);
          if (!codeNumber) {
            if (!parentId || level === 'root') {
              codeNumber = String(rootCounters[type]++);
            } else {
              if (!parentDoc) parentDoc = await Category.findById(parentId);
              await ensureDocHasCode(parentDoc);
              codeNumber = await nextChildFromCache(parentDoc);
            }
          }

          const displayOrder = toInt(row.displayorder ?? row.display_order ?? canon.displayorder) ?? 0;
          await upsertCategory({ type, name, codeNumber, parentId, isActive, description, displayOrder });
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
      'IsActive',
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
        CodeNumber: '1',
        IsActive: 'true',
        Name: 'Art Prints',
        Description: 'All art prints',
        Type: type,
        Level: 'root',
        RootCategory: '',
        SubCategory: '',
        Parent: ''
      },
      {
        CodeNumber: '1-1',
        IsActive: 'true',
        Name: 'Vintage Photograph',
        Description: 'Photography based prints',
        Type: type,
        Level: 'sub',
        RootCategory: 'Art Prints',
        SubCategory: '',
        Parent: ''
      },
      {
        CodeNumber: '1-1-1',
        IsActive: 'true',
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
