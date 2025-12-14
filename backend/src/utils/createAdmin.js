import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'readline';
import Admin from '../models/Admin.js';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const main = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/frameit';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin details
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const name = await question('Enter admin name: ');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('❌ Admin with this email already exists');
      process.exit(1);
    }

    // Create admin
    const admin = new Admin({
      email,
      password,
      name,
      role: 'admin',
    });

    await admin.save();
    console.log('\n✅ Admin created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
};

main();

