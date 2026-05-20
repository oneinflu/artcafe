const mongoose = require('mongoose');
require('dotenv').config();
const AttributeGroup = require('./models/AttributeGroup');
const sheetData = require('./sheet_sheet1.json');

const importAttributes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Attributes Import...');

    // Clear existing attribute groups
    await AttributeGroup.deleteMany({});
    console.log('Cleared existing AttributeGroups.');

    // We want to map each key to a Set of unique values
    const groups = {};

    for (const row of sheetData) {
      for (const [key, value] of Object.entries(row)) {
        if (!value) continue;
        const trimmedKey = key.trim();
        const trimmedValue = String(value).trim();
        if (!trimmedValue) continue;

        if (!groups[trimmedKey]) {
          groups[trimmedKey] = new Set();
        }
        groups[trimmedKey].add(trimmedValue);
      }
    }

    for (const [groupName, variationsSet] of Object.entries(groups)) {
      const variations = Array.from(variationsSet).map(varName => ({
        name: varName,
        surchargeType: '+',
        surchargeValue: 0
      }));

      const groupObj = new AttributeGroup({
        name: groupName,
        variations: variations
      });

      await groupObj.save();
      console.log(`Created Attribute Group: "${groupName}" with ${variations.length} variations:`, Array.from(variationsSet));
    }

    const count = await AttributeGroup.countDocuments();
    console.log(`Attribute Group seeding completed. Total groups imported: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding attributes:', err);
    process.exit(1);
  }
};

importAttributes();
