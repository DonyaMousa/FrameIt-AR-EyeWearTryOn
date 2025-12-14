import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

dotenv.config();

const main = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/frameit';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // List all admins
    const admins = await Admin.find({});
    
    if (admins.length === 0) {
      console.log('❌ No admins found in database');
      console.log('\nRun: npm run create-admin\n');
      process.exit(1);
    }

    console.log(`Found ${admins.length} admin(s):\n`);
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log('');
    });

    // Test password if provided
    const testEmail = process.argv[2];
    const testPassword = process.argv[3];

    if (testEmail && testPassword) {
      console.log(`\nTesting login for: ${testEmail}`);
      const admin = await Admin.findOne({ email: testEmail.toLowerCase() });
      
      if (!admin) {
        console.log('❌ Admin not found');
        process.exit(1);
      }

      const isValid = await admin.comparePassword(testPassword);
      if (isValid) {
        console.log('✅ Password is correct!');
      } else {
        console.log('❌ Password is incorrect');
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

main();

