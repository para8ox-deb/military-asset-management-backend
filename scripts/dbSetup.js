const mongoose = require('mongoose');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create indexes for better performance
    const db = mongoose.connection.db;

    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ baseId: 1 });

    // Assets collection indexes
    await db.collection('assets').createIndex({ assetId: 1, baseId: 1 }, { unique: true });
    await db.collection('assets').createIndex({ type: 1 });
    await db.collection('assets').createIndex({ baseId: 1 });
    await db.collection('assets').createIndex({ status: 1 });

    // Purchases collection indexes
    await db.collection('purchases').createIndex({ purchaseDate: -1 });
    await db.collection('purchases').createIndex({ baseId: 1 });
    await db.collection('purchases').createIndex({ assetType: 1 });
    await db.collection('purchases').createIndex({ status: 1 });

    // Transfers collection indexes
    await db.collection('transfers').createIndex({ transferDate: -1 });
    await db.collection('transfers').createIndex({ fromBaseId: 1 });
    await db.collection('transfers').createIndex({ toBaseId: 1 });
    await db.collection('transfers').createIndex({ status: 1 });

    // Assignments collection indexes
    await db.collection('assignments').createIndex({ assignmentDate: -1 });
    await db.collection('assignments').createIndex({ baseId: 1 });
    await db.collection('assignments').createIndex({ status: 1 });
    await db.collection('assignments').createIndex({ assignedTo: 1 });

    console.log('Database indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
