import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/frameit';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get image filename from command line argument
    const imageFilename = process.argv[2] || 'rayban-aviator-classic.jpg';
    const imagePath = `images/products/${imageFilename}`;
    const fullImagePath = path.join(__dirname, '../public', imagePath);

    // Find Rayban Aviator Classic product
    const product = await Product.findOne({ name: 'Rayban Aviator Classic' });

    if (!product) {
      console.log('❌ Product "Rayban Aviator Classic" not found');
      console.log('\nAvailable products:');
      const allProducts = await Product.find({}, 'name');
      allProducts.forEach(p => console.log(`  - ${p.name}`));
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`✅ Found product: ${product.name}`);
    console.log(`   Current images: ${product.images?.length || 0}\n`);

    // Check if image file exists
    if (!fs.existsSync(fullImagePath)) {
      console.log(`⚠️  Image file not found: ${fullImagePath}`);
      console.log(`\nPlease save your image as: ${imageFilename}`);
      console.log(`In directory: ${path.dirname(fullImagePath)}`);
      console.log(`\nOr provide the image filename as argument:`);
      console.log(`  npm run add-product-image your-image.jpg\n`);
      
      // Still add the path to database (file can be added later)
      console.log('📝 Adding image path to database anyway...\n');
    } else {
      console.log(`✅ Image file found: ${imagePath}\n`);
    }

    // Add image to product if not already present
    if (!product.images) {
      product.images = [];
    }

    if (!product.images.includes(imagePath)) {
      product.images.push(imagePath);
      await product.save();
      console.log(`✅ Image path added to database: ${imagePath}`);
      console.log(`   Total images: ${product.images.length}`);
    } else {
      console.log(`ℹ️  Image path already exists in database: ${imagePath}`);
    }

    console.log(`\n✅ Product updated successfully!`);
    console.log(`   Product: ${product.name}`);
    console.log(`   Images in database:`);
    product.images.forEach((img, idx) => {
      console.log(`     ${idx + 1}. ${img}`);
    });
    console.log(`\n   Image URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/api/static/${imagePath}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

main();

