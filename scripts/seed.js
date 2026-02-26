const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

async function seedSuperAdmin() {
  const client = new MongoClient(process.env.MONGO_URL);

  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');

    // Check if super admin already exists
    const existingSuperAdmin = await usersCollection.findOne({ role: 'super_admin' });

    if (existingSuperAdmin) {
      console.log('✓ Super admin already exists. Skipping seed.');
      return;
    }

    // Create super admin from .env variables
    const superAdmin = {
      id: 'super_admin_001',
      name: process.env.SUPER_ADMIN_NAME,
      email: process.env.SUPER_ADMIN_EMAIL,
      phone: process.env.SUPER_ADMIN_PHONE,
      password: bcrypt.hashSync(process.env.SUPER_ADMIN_PASSWORD, 10),
      role: 'super_admin',
      created_at: new Date(),
      updated_at: new Date(),
    };

    await usersCollection.insertOne(superAdmin);
    console.log('✓ Super admin created successfully!');
    console.log(`  Name: ${superAdmin.name}`);
    console.log(`  Email: ${superAdmin.email}`);
    console.log(`  Phone: ${superAdmin.phone}`);

    // Create default branches
    const branchesCollection = db.collection('branches');
    const existingBranches = await branchesCollection.countDocuments();

    if (existingBranches === 0) {
      const branches = [
        {
          id: 'branch_001',
          name: 'Main Branch',
          address: 'Kawla Zamindarbari, Dakshinkhan, Dhaka',
          created_at: new Date(),
        },
        {
          id: 'branch_002',
          name: 'Secondary Branch',
          address: 'Kawla Zamindarbari, Dakshinkhan, Dhaka',
          created_at: new Date(),
        },
      ];

      await branchesCollection.insertMany(branches);
      console.log('✓ Default branches created!');
    }

  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedSuperAdmin();
