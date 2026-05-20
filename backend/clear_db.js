const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Space = require('./models/Space');
const Style = require('./models/Style');
const Collection = require('./models/Collection');
const Order = require('./models/Order');
const BulkRequest = require('./models/BulkRequest');
const Artist = require('./models/Artist');
const Architect = require('./models/Architect');
const AttributeGroup = require('./models/AttributeGroup');
const CaseStudy = require('./models/CaseStudy');
const User = require('./models/User');

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for clearing data...');

    // Delete everything in non-user tables
    const productRes = await Product.deleteMany({});
    console.log(`Deleted ${productRes.deletedCount} Products.`);

    const categoryRes = await Category.deleteMany({});
    console.log(`Deleted ${categoryRes.deletedCount} Categories.`);

    const spaceRes = await Space.deleteMany({});
    console.log(`Deleted ${spaceRes.deletedCount} Spaces.`);

    const styleRes = await Style.deleteMany({});
    console.log(`Deleted ${styleRes.deletedCount} Styles.`);

    const collectionRes = await Collection.deleteMany({});
    console.log(`Deleted ${collectionRes.deletedCount} Collections.`);

    const orderRes = await Order.deleteMany({});
    console.log(`Deleted ${orderRes.deletedCount} Orders.`);

    const bulkRes = await BulkRequest.deleteMany({});
    console.log(`Deleted ${bulkRes.deletedCount} Bulk Requests.`);

    const artistRes = await Artist.deleteMany({});
    console.log(`Deleted ${artistRes.deletedCount} Artists.`);

    const architectRes = await Architect.deleteMany({});
    console.log(`Deleted ${architectRes.deletedCount} Architects.`);

    const attributeRes = await AttributeGroup.deleteMany({});
    console.log(`Deleted ${attributeRes.deletedCount} Attribute Groups.`);

    const caseStudyRes = await CaseStudy.deleteMany({});
    console.log(`Deleted ${caseStudyRes.deletedCount} Case Studies.`);

    // For Users, delete all users except admin users
    const userRes = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`Deleted ${userRes.deletedCount} Customer/Artist/Architect Users. Kept Admin users.`);

    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log(`Remaining active admin accounts: ${adminCount}`);

    console.log('Database cleanup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing database:', err);
    process.exit(1);
  }
};

clearDatabase();
