const AttributeGroup = require('../models/AttributeGroup');

exports.getAttributeGroups = async (req, res) => {
  try {
    const groups = await AttributeGroup.find();
    res.json(groups);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.createAttributeGroup = async (req, res) => {
  try {
    const newGroup = new AttributeGroup(req.body);
    const group = await newGroup.save();
    res.json(group);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updateAttributeGroup = async (req, res) => {
  try {
    const group = await AttributeGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(group);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.deleteAttributeGroup = async (req, res) => {
  try {
    await AttributeGroup.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Attribute Group removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const fs = require('fs');
const csv = require('csv-parser');

exports.bulkUploadAttributes = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
    .on('data', (data) => {
      console.log('CSV Row:', data);
      results.push(data);
    })
    .on('end', async () => {
      try {
        const groupsMap = {};
        for (const row of results) {
          // Robust header matching
          const keys = Object.keys(row);
          const findKey = (possibleNames) => {
            return keys.find(k => {
              const cleaned = k.toLowerCase().trim();
              return possibleNames.some(name => cleaned.includes(name.toLowerCase()));
            });
          };

          const groupKey = findKey(['group name', 'group', 'name']);
          const varKey = findKey(['variation name', 'variation', 'value']);
          const typeKey = findKey(['surcharge type', 'type']);
          const valKey = findKey(['surcharge value', 'price', 'surcharge']);

          const groupName = row[groupKey];
          const varName = row[varKey];
          const surType = row[typeKey] || 'x';
          const surValStr = row[valKey];
          const surVal = surValStr !== undefined && surValStr !== '' ? parseFloat(surValStr) : 1;

          console.log(`Processing: RowKeys=${keys.join('|')} | Group=${groupName}, Var=${varName}, Type=${surType}, Val=${surVal}`);

          if (!groupName || !varName) {
            console.log('Skipping row due to missing groupName or varName');
            continue;
          }

          if (!groupsMap[groupName]) {
            groupsMap[groupName] = [];
          }
          groupsMap[groupName].push({
            name: varName,
            surchargeType: surType,
            surchargeValue: surVal
          });
        }

        console.log('Final groupsMap:', JSON.stringify(groupsMap, null, 2));

        // Upsert groups
        for (const [gName, variations] of Object.entries(groupsMap)) {
          await AttributeGroup.findOneAndUpdate(
            { name: gName },
            { name: gName, variations: variations },
            { upsert: true, new: true }
          );
        }

        fs.unlinkSync(req.file.path); // cleanup
        res.json({ msg: 'Bulk attributes uploaded successfully' });
      } catch (err) {
        console.error('Bulk upload attributes error:', err);
        res.status(500).json({ msg: 'Error processing CSV' });
      }
    });
};
