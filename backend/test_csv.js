const csv = require('csv-parser');
const stream = require('stream');

const mockCsvData = `Name,Price,Category,[Attr] Paper Type,[Attr] Paper GSM
"Test Product",100,"Business Cards","Matte|Glossy","250 GSM|300 GSM"`;

const results = [];
const s = new stream.Readable();
s.push(mockCsvData);
s.push(null);

s.pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
 .on('data', (data) => {
    const normalizedRow = {};
    Object.keys(data).forEach(key => {
      normalizedRow[key.trim().toLowerCase()] = data[key];
    });
    normalizedRow._original = data;
    results.push(normalizedRow);
 })
 .on('end', () => {
    results.forEach(row => {
      console.log('Row Keys:', Object.keys(row));
      console.log('Original Keys:', Object.keys(row._original));
      
      let attributes = [];
      for (const key of Object.keys(row._original)) {
        const cleanKey = key.trim();
        console.log(`Checking key: "${cleanKey}"`);
        if (cleanKey.startsWith('[Attr]')) {
          const groupName = cleanKey.replace('[Attr]', '').trim();
          const varsStr = row._original[key];
          console.log(`Matched! Group: "${groupName}", Vars: "${varsStr}"`);
        }
      }
    });
 });
