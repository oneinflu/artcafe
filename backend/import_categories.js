const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');

const rawData = `514	Love Hyd - Vizag Mugs	
3	Incense Sticks	
515	Lingo Series Mugs	
4	Incense Cones	
6	Wallet	
7	Card Holder	
8	Card Case	
520	Botanical	Coasters & Table Mats
9	Passport Holder	
10	Mini Passport Holder	
12	Cheque Book Holder	
13	Laptop Sleeve	
15	Pens	Stationery
16	Diaries & Notebooks	Stationery
18	Cushion Cover	Furnishings
280	Gond Art	
28	Stoles & Scarfs	
35	Candle Holder	
547	Contemporary Abstract Prints	Art Prints
37	Clock	
549	Alphabets	Art Prints
551	Alcohol	
552	Bicycle	
553	Coffee	
554	Beer	
555	Fashion	
556	Car	
557	Tea	
558	Moulin Rouge	
559	Modern Prints - Set	
560	Architectural	Coasters & Table Mats
561	Art	Coasters & Table Mats
562	Pattern	Coasters & Table Mats
308	297	
54	Pouch	
311	296	
312	282	
313	298	
314	169	
315	239	
316	299	
317	295	
318	304	
578	Kalighat Prints	Fine Art Prints
67	Coffee	
68	Black Tea	
580	Love Hyderabad	Coasters & Table Mats
69	Herb Tea	
581	Lingo Series	
70	Green Tea	
71	Early Grey Tea	
583	Illustrations	Coasters & Table Mats
73	Oolong Tea	
75	White Tea	
76	Tea Collection	
596	Zodiac Sign Prints	Vintage Lithographs
94	BAGS	
98	Sling Wallet	
610	Delhi Series	Caricature Prints
100	Cyanotype Prints	
101	Others 1	
617	Painting Prints	Fine Art Prints
363	Landscape or Seascape Paintings	
364	Still Life Painting	
365	Religious or Spiritual Paintings	
366	Pop Art	
367	Abstract Paintings	
368	Portrait Painting	
113	Bracelets	
369	Mural Painting	
114	Cuff Link	
370	Installations	
115	Bangles	
371	Cityscape	
116	Necklace	
372	Animals Birds and Nature	
117	Key Chain	
373	Figurative	
629	Cherial Plates	
119	Luggage Tag	
120	Finger Rings	
376	Boxes	
377	Boxes	
122	Ear rings	
123	Ear Cuffs	
380	Cheriyal Plates	
381	Pitchwai Style	
127	Ear top	
639	Windows to the Gods	Decorative Plates
128	Ear Stud	
129	Straw	
641	Vintage Photos & Maps Plates	Decorative Plates
642	Caricature Plates	Decorative Plates
644	Showcase Products	Filters
645	Filters	
646	Area By Space	Filters
391	Hyderabad / Secunderabad / Cyberabad	
647	Occasion	Filters
136	Maha Raja Prints	
648	Art for Office Spaces	Filters
137	Nostalgia Prints	
649	Art for Residences	Filters
138	MahaRaja Frames	
650	Art for Hotels	Filters
139	Brooch	
651	Art for Restaurants & Cafe	Filters
140	Jhumka	
652	Art by Theme	Filters
141	hansli	
142	CHain	
143	Pendant	
144	Ring	
400	Set of Religious or Spiritual Prints	
656	Pitchwai	Traditional Art
401	Set of Misc Prints	
657	Phad Art	Traditional Art
147	Prints	
149	Frames	
662	Bidri	Traditional Craft
151	Photo frames	
663	Oriental Landscapes	Vintage Lithographs
664	Tantrik Art	Traditional Art
153	T - Shirts	
665	Water colour	Original Paintings
667	Paintings	Vintage Art
668	Indian Art	Art Prints
670	Hyderabad  Secunderabad  Cyberabad Maps	Modern Maps
675	Botanical & Zoological	Vintage Lithographs
433	Hollywood	
434	Bollywood	
435	Travel	
436	Raja Ravi Varma	
437	Embalished	Raja Ravi Varma
438	Normal	Raja Ravi Varma
448	Art Exhibition Catalogues	
449	Cultural Festival Catalogues	
460	Vintage Photographs	Coasters & Table Mats
461	Vintage Maps	Coasters & Table Mats
462	Lingo Series	Coasters & Table Mats
464	Modern Digital Prints	Coasters & Table Mats
465	Modern Maps	Coasters & Table Mats
466	Zoological	Coasters & Table Mats
467	Astronomy	Coasters & Table Mats
469	Caricature	Coasters & Table Mats
470	Vintage Artifacts	Coasters & Table Mats
472	Hyderabad	
498	Ceramic Plates	
499	Clocks	
250	Cheriyal	
251	Pattachitra	
507	Coaster	
252	Kalighat Painting or Bengal Painting	
253	Warli Paintings	
511	Themes	
257	Vintage Travel Series	Vintage Poster
537	Devanagiri  Series	
320	Vintage Photograph	
321	Hyderabad	Vintage Photograph
590	Incense Stick	
349	City Map Prints	Vintage Map
230	Paintings	
486	Coffee	
505	Hyderabad Series	Caricature Prints
261	Pencil & Charcoal	
575	Airavata	
322	Bombay	Vintage Photograph
586	Incense Cones	
618	Vintage Patent Posters	Vintage Poster
388	Art Prints	
193	Indian Sub-Continent	Vintage Map
504	Kolkata Series	Caricature Prints
576	Pichwai	
323	Calcutta	Vintage Photograph
348	Asia Map Prints	Vintage Map
166	Vintage Map	
484	Beer	
536	Shores of Persia	
324	Delhi	Vintage Photograph
347	World Map Prints	Vintage Map
485	Whiskey	
503	Caricature Prints	
538	Spring in Udaipur	
325	Madras	Vintage Photograph
346	Pilgrimage Map Prints	Vintage Map
654	Traditional Art	
655	Original Paintings	
492	Wine	
326	Bangalore / Mysore	Vintage Photograph
582	Jyamiti	
481	Bath Room	
540	Banara	
305	Art Prints - Limited Edition	
615	Royalty	Vintage Photograph
483	Kitchen	
539	Indira	
353	Vintage Poster	
487	Music	
541	The Lotus at Fathepur	
459	Coasters & Table Mats	
502	Harley Davidson	
542	Jodhpur Evenings	
622	Lucknow / Kanpur	Vintage Photograph
633	Decorative Plates	
543	The Mughal Garden	
623	Agra	Vintage Photograph
658	Metallic Devotions	
480	Airplane	
625	Varanasi / Banaras	Vintage Photograph
661	Traditional Craft	
482	Sailing	
501	Star Wars	
488	Typewriter	
624	Other Cities	Vintage Photograph
493	Ophthalmologist	
494	Medical Drug	
491	Medicine	
14	Stationery	
350	Vintage Lithographs	
669	Modern Maps	
671	Religious Prints	Art Prints
176	Furnishings	
358	Fine Art Prints	
676	Love Hyderabad and Lingo Series	Art Prints
611	Miniatures	
666	Vintage Art	`;

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Category Import...');

    // Clear existing to avoid duplicates
    await Category.deleteMany({});
    console.log('Cleared existing categories.');

    const lines = rawData.split('\n');
    const parsedData = [];
    const allParentNamesSet = new Set();

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      const parts = line.split('\t');
      
      const categoryName = parts[1]?.trim();
      const parentName = parts[2]?.trim();

      // Skip invalid header, empty, or numeric categories
      if (!categoryName || categoryName.toLowerCase() === 'category' || /^\d+$/.test(categoryName)) {
        continue;
      }

      parsedData.push({
        categoryName,
        parentName: (parentName && !/^\d+$/.test(parentName)) ? parentName : null
      });

      if (parentName && !/^\d+$/.test(parentName)) {
        allParentNamesSet.add(parentName);
      }
    }

    const nameToIdMap = new Map();

    // Step 1: Create parent categories
    console.log('Seeding parent categories...');
    let parentIndex = 0;
    for (const parentName of allParentNamesSet) {
      const lowerParent = parentName.toLowerCase();
      if (!nameToIdMap.has(lowerParent)) {
        const newParent = new Category({
          name: parentName,
          type: 'product',
          parentCategory: null,
          displayOrder: parentIndex++
        });
        await newParent.save();
        nameToIdMap.set(lowerParent, newParent._id);
        console.log(`Created parent category: ${parentName}`);
      }
    }

    // Step 2: Create subcategories and root categories
    console.log('Seeding subcategories...');
    for (let index = 0; index < parsedData.length; index++) {
      const item = parsedData[index];
      const lowerName = item.categoryName.toLowerCase();
      const parentId = item.parentName ? nameToIdMap.get(item.parentName.toLowerCase()) : null;

      if (!nameToIdMap.has(lowerName)) {
        const newCat = new Category({
          name: item.categoryName,
          type: 'product',
          parentCategory: parentId,
          displayOrder: index
        });
        await newCat.save();
        nameToIdMap.set(lowerName, newCat._id);
        console.log(`Created category: ${item.categoryName} (Parent: ${item.parentName || 'None'}, Order: ${index})`);
      } else {
        // If it already exists, update parent and displayOrder
        const updates = { displayOrder: index };
        if (parentId) updates.parentCategory = parentId;
        
        await Category.findByIdAndUpdate(nameToIdMap.get(lowerName), updates);
        console.log(`Linked/Updated category: ${item.categoryName} (Parent: ${item.parentName || 'None'}, Order: ${index})`);
      }
    }

    const count = await Category.countDocuments();
    console.log(`Category seeding completed. Total categories imported: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exit(1);
  }
};

runSeeder();
