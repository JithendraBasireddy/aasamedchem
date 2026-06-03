require('dotenv').config();
const mongoose = require('mongoose');

// Import Models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Quotation = require('./models/Quotation');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Quotation.deleteMany();
    console.log('Cleared existing database entries.');

    // 1. Create Default Users (User schema's pre-save hook will hash these automatically)
    const users = await User.create([
      {
        name: 'AASA Admin User',
        email: 'admin@medchem.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Jithendra Seller',
        email: 'seller@medchem.com',
        password: 'seller123',
        role: 'seller'
      }
    ]);
    console.log(`Successfully created ${users.length} users (Admin & Seller).`);

    // 2. Create Categories
    const categories = await Category.create([
      { name: 'Chemicals', description: 'Reagents, solvents, and bulk powder chemical compounds' },
      { name: 'Lab Equipment', description: 'Glassware, vials, pipettes, and safety instruments' },
      { name: 'Grains & Solids', description: 'Raw solids, starch powders, and organic dry goods' }
    ]);
    console.log(`Successfully created ${categories.length} categories.`);

    const chemCategory = categories.find(c => c.name === 'Chemicals')._id;
    const equipCategory = categories.find(c => c.name === 'Lab Equipment')._id;

    // 3. Create Products (base units: g, mL, item. basePricePerUnit: INR per 1 base unit)
    const products = await Product.create([
      {
        sku: 'CHEM-GLU-001',
        name: 'D-Glucose Powder',
        description: 'High purity D-glucose powder for laboratory assays.',
        category: chemCategory,
        baseUnit: 'g',
        basePricePerUnit: 0.15, // Rs. 0.15 per gram (Rs. 150 per kg)
        stockQuantity: 5000 // 5000g (= 5 kg)
      },
      {
        sku: 'CHEM-ETH-102',
        name: 'Ethanol 99%',
        description: 'Laboratory grade solvent. Keep away from heat.',
        category: chemCategory,
        baseUnit: 'mL',
        basePricePerUnit: 0.45, // Rs. 0.45 per mL (Rs. 450 per Liter)
        stockQuantity: 10000 // 10000mL (= 10 Liters)
      },
      {
        sku: 'CHEM-NACL-003',
        name: 'Sodium Chloride Reagent',
        description: 'Analytical grade NaCl salt powder.',
        category: chemCategory,
        baseUnit: 'g',
        basePricePerUnit: 0.05, // Rs. 0.05 per gram (Rs. 50 per kg)
        stockQuantity: 20000 // 20000g (= 20 kg)
      },
      {
        sku: 'EQ-GLV-201',
        name: 'Glass Vials 10ml',
        description: 'Borosilicate glass vials with air-tight caps.',
        category: equipCategory,
        baseUnit: 'item',
        basePricePerUnit: 15.00, // Rs. 15.00 per vial
        stockQuantity: 500 // 500 vials
      }
    ]);
    console.log(`Successfully seeded ${products.length} products with stock and unit metrics.`);

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
