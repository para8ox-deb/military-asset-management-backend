const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Asset = require('../models/Asset');
const Purchase = require('../models/Purchase');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Asset.deleteMany({});
    await Purchase.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@military.gov',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();

    // Create base commanders
    const baseCommander1 = new User({
      username: 'base_cmd_alpha',
      email: 'commander.alpha@military.gov',
      password: 'commander123',
      role: 'base_commander',
      baseId: 'BASE_ALPHA'
    });

    const baseCommander2 = new User({
      username: 'base_cmd_bravo',
      email: 'commander.bravo@military.gov',
      password: 'commander123',
      role: 'base_commander',
      baseId: 'BASE_BRAVO'
    });

    await baseCommander1.save();
    await baseCommander2.save();

    // Create logistics officers
    const logisticsOfficer1 = new User({
      username: 'logistics_alpha',
      email: 'logistics.alpha@military.gov',
      password: 'logistics123',
      role: 'logistics_officer'
    });

    const logisticsOfficer2 = new User({
      username: 'logistics_bravo',
      email: 'logistics.bravo@military.gov',
      password: 'logistics123',
      role: 'logistics_officer'
    });

    await logisticsOfficer1.save();
    await logisticsOfficer2.save();

    // Create sample assets
    const sampleAssets = [
      {
        assetId: 'M4A1-001',
        name: 'M4A1 Carbine',
        type: 'weapon',
        baseId: 'BASE_ALPHA',
        quantity: 50,
        assignedQuantity: 10,
        expendedQuantity: 2,
        specifications: {
          caliber: '5.56×45mm NATO',
          weight: '3.4 kg',
          length: '838 mm'
        }
      },
      {
        assetId: 'HMMWV-001',
        name: 'High Mobility Multipurpose Wheeled Vehicle',
        type: 'vehicle',
        baseId: 'BASE_ALPHA',
        quantity: 15,
        assignedQuantity: 8,
        expendedQuantity: 0,
        specifications: {
          engine: '6.5L V8 Diesel',
          weight: '2,359 kg',
          capacity: '4 personnel'
        }
      },
      {
        assetId: 'AMMO-556-001',
        name: '5.56mm NATO Ammunition',
        type: 'ammunition',
        baseId: 'BASE_BRAVO',
        quantity: 10000,
        assignedQuantity: 2000,
        expendedQuantity: 500,
        specifications: {
          caliber: '5.56×45mm',
          type: 'Ball M855',
          weight: '12.31g'
        }
      },
      {
        assetId: 'RADIO-001',
        name: 'AN/PRC-152 Radio',
        type: 'equipment',
        baseId: 'BASE_BRAVO',
        quantity: 25,
        assignedQuantity: 15,
        expendedQuantity: 1,
        specifications: {
          frequency: '30-512 MHz',
          power: '5W',
          weight: '1.2 kg'
        }
      }
    ];

    await Asset.insertMany(sampleAssets);

    // Create sample purchases
    const samplePurchases = [
      {
        assetId: 'M4A1-001',
        assetName: 'M4A1 Carbine',
        assetType: 'weapon',
        baseId: 'BASE_ALPHA',
        quantity: 25,
        unitPrice: 1200,
        totalPrice: 30000,
        vendor: 'Colt Defense LLC',
        purchasedBy: adminUser._id,
        status: 'delivered',
        purchaseDate: new Date('2025-01-15')
      },
      {
        assetId: 'HMMWV-001',
        assetName: 'High Mobility Multipurpose Wheeled Vehicle',
        assetType: 'vehicle',
        baseId: 'BASE_ALPHA',
        quantity: 5,
        unitPrice: 85000,
        totalPrice: 425000,
        vendor: 'AM General',
        purchasedBy: adminUser._id,
        status: 'delivered',
        purchaseDate: new Date('2025-02-01')
      }
    ];

    await Purchase.insertMany(samplePurchases);

    console.log('Seed data created successfully!');
    console.log('\nDefault Users Created:');
    console.log('Admin: admin@military.gov / admin123');
    console.log('Base Commander Alpha: commander.alpha@military.gov / commander123');
    console.log('Base Commander Bravo: commander.bravo@military.gov / commander123');
    console.log('Logistics Alpha: logistics.alpha@military.gov / logistics123');
    console.log('Logistics Bravo: logistics.bravo@military.gov / logistics123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
