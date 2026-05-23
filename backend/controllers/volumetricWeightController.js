const VolumetricWeight = require('../models/VolumetricWeight');

const normalizeSize = (value) => String(value || '').trim();
const normalizeMedium = (value) => String(value || '').trim();

const toNumber = (value) => {
  if (value === undefined || value === null) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : undefined;
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.subCategory) filter.subCategory = req.query.subCategory;
    const items = await VolumetricWeight.find(filter).populate('subCategory');
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.lookup = async (req, res) => {
  try {
    const subCategoryId = String(req.query.subCategoryId || '').trim();
    const size = normalizeSize(req.query.size);
    const medium = normalizeMedium(req.query.medium);
    if (!subCategoryId || !size || !medium) {
      return res.status(400).json({ msg: 'subCategoryId, size, and medium are required' });
    }
    const item = await VolumetricWeight.findOne({ subCategory: subCategoryId, size, medium });
    if (!item) return res.status(404).json({ msg: 'Not found' });
    res.json({ weightKg: item.weightKg });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.upsert = async (req, res) => {
  try {
    const subCategoryId = String(req.body.subCategoryId || '').trim();
    const size = normalizeSize(req.body.size);
    const medium = normalizeMedium(req.body.medium);
    const grams = toNumber(req.body.weightGrams);
    if (!subCategoryId || !size || !medium || grams === undefined) {
      return res.status(400).json({ msg: 'subCategoryId, size, medium, and weightGrams are required' });
    }
    const weightKg = grams / 1000;
    const item = await VolumetricWeight.findOneAndUpdate(
      { subCategory: subCategoryId, size, medium },
      { subCategory: subCategoryId, size, medium, weightKg },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('subCategory');
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await VolumetricWeight.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Removed' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
