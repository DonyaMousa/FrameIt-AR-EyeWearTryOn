import dotenv from 'dotenv';
import mongoose from 'mongoose';
import GlassesModel from '../models/GlassesModel.js';
import Product from '../models/Product.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { processGLTFModel, updateGLTFTexturePaths } from './processGLTFModel.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/frameit';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Check if Rayban already exists - delete and recreate for fresh seed
    const existingModel = await GlassesModel.findOne({ name: 'rayban-aviator' });
    if (existingModel) {
      console.log('⚠️  Rayban model already exists. Removing old data...');
      // Delete associated product
      await Product.deleteMany({ glassesModelId: existingModel._id });
      // Delete the model
      await GlassesModel.deleteOne({ _id: existingModel._id });
      console.log('✅ Removed existing Rayban data\n');
    }

    // Check if model files exist
    const modelDir = path.join(__dirname, '../public/models/glasses/rayban-aviator');
    const occluderPath = path.join(__dirname, '../public/models/occluders/face.json');
    const envMapPath = path.join(__dirname, '../public/textures/envMaps/default.jpg');
    
    if (!fs.existsSync(modelDir)) {
      console.log('⚠️  Rayban model files not found. Creating directory...');
      fs.mkdirSync(modelDir, { recursive: true });
    }

    // Build modelFiles object with only existing files
    const modelFiles = {};

    // Check for GLTF file (prefer scene.gltf, then rayban-model.gltf, then .glb)
    const sceneGltfPath = path.join(modelDir, 'scene.gltf');
    const gltfPath = path.join(modelDir, 'rayban-model.gltf');
    const glbPath = path.join(modelDir, 'rayban-model.glb');
    
    if (fs.existsSync(sceneGltfPath)) {
      modelFiles.frameGLTF = 'models/glasses/rayban-aviator/scene.gltf';
      // Also set frame as fallback
      modelFiles.frame = 'models/glasses/rayban-aviator/scene.gltf';
    } else if (fs.existsSync(gltfPath)) {
      modelFiles.frameGLTF = 'models/glasses/rayban-aviator/rayban-model.gltf';
      modelFiles.frame = 'models/glasses/rayban-aviator/rayban-model.gltf';
    } else if (fs.existsSync(glbPath)) {
      modelFiles.frameGLTF = 'models/glasses/rayban-aviator/rayban-model.glb';
      modelFiles.frame = 'models/glasses/rayban-aviator/rayban-model.glb';
    } else {
      // Fallback to JSON if GLTF not found
      const jsonPath = path.join(modelDir, 'rayban-model.json');
      if (fs.existsSync(jsonPath)) {
        modelFiles.frame = 'models/glasses/rayban-aviator/rayban-model.json';
      }
    }

    // Check for optional files
    const lensesPath = path.join(modelDir, 'lenses.json');
    if (fs.existsSync(lensesPath)) {
      modelFiles.lenses = 'models/glasses/rayban-aviator/lenses.json';
    }

    if (fs.existsSync(occluderPath)) {
      modelFiles.occluder = 'models/occluders/face.json';
    }

    if (fs.existsSync(envMapPath)) {
      modelFiles.envMap = 'textures/envMaps/default.jpg';
    }

    // Check for texture files
    const textureDir = path.join(__dirname, '../public/textures/rayban-aviator');
    if (fs.existsSync(textureDir)) {
      const textureFiles = fs.readdirSync(textureDir);
      
      // Map textures - GLTF models use baseColor textures
      textureFiles.forEach(file => {
        const lowerName = file.toLowerCase();
        
        // Check for baseColor textures (common in GLTF models)
        if (lowerName.includes('basecolor') || lowerName.includes('base_color')) {
          // Use the first baseColor texture as frame texture
          if (!modelFiles.frameTexture) {
            modelFiles.frameTexture = `textures/rayban-aviator/${file}`;
          }
        }
        
        // Legacy naming patterns
        if (lowerName.includes('frame') && (lowerName.includes('texture') || lowerName.includes('diffuse'))) {
          modelFiles.frameTexture = `textures/rayban-aviator/${file}`;
        } else if (lowerName.includes('frame') && lowerName.includes('normal')) {
          modelFiles.frameNormalMap = `textures/rayban-aviator/${file}`;
        } else if (lowerName.includes('frame') && lowerName.includes('rough')) {
          modelFiles.frameRoughnessMap = `textures/rayban-aviator/${file}`;
        } else if (lowerName.includes('frame') && lowerName.includes('metal')) {
          modelFiles.frameMetalnessMap = `textures/rayban-aviator/${file}`;
        } else if (lowerName.includes('lens') && (lowerName.includes('texture') || lowerName.includes('diffuse'))) {
          modelFiles.lensTexture = `textures/rayban-aviator/${file}`;
        } else if (lowerName.includes('lens') && lowerName.includes('normal')) {
          modelFiles.lensNormalMap = `textures/rayban-aviator/${file}`;
        }
      });
      
      // If no frame texture found, use first texture file
      if (!modelFiles.frameTexture && textureFiles.length > 0) {
        modelFiles.frameTexture = `textures/rayban-aviator/${textureFiles[0]}`;
      }
    }

    // Process GLTF model if present
    let modelMetadata = { scale: 1.0, position: { x: 0, y: 0, z: 0.4 }, rotation: { x: 0, y: 0, z: 0 } };
    if (modelFiles.frameGLTF) {
      try {
        const gltfFullPath = path.join(__dirname, '../public', modelFiles.frameGLTF);
        
        // Update texture paths in GLTF
        console.log('📝 Updating GLTF texture paths...');
        updateGLTFTexturePaths(gltfFullPath, 'rayban-aviator');
        
        // Process GLTF to get optimal scale and position
        console.log('⚙️  Processing GLTF model...');
        modelMetadata = await processGLTFModel(gltfFullPath);
        console.log('✅ GLTF processed with metadata:', modelMetadata);
      } catch (error) {
        console.error('⚠️  Error processing GLTF:', error.message);
        console.log('   Continuing with default metadata...');
      }
    }

    // Create GlassesModel
    const glassesModel = new GlassesModel({
      name: 'rayban-aviator',
      category: 'Sunglasses',
      description: 'Classic Rayban Aviator sunglasses with premium quality',
      modelFiles,
      modelMetadata,
      isActive: true,
    });

    await glassesModel.save();
    console.log('✅ Created GlassesModel: rayban-aviator');

    // Create Product
    const product = new Product({
      name: 'Rayban Aviator Classic',
      brand: 'Rayban',
      price: 159.99,
      originalPrice: 199.99,
      description: 'Classic aviator sunglasses with premium lenses and durable frame. Perfect for everyday wear.',
      category: 'Sunglasses',
      gender: 'Unisex',
      frameColor: 'Gold',
      lensColor: 'Green',
      material: 'Metal',
      frameShape: 'Aviator',
      images: [], // Product images can be added later via admin panel
      glassesModelId: glassesModel._id,
      isActive: true,
    });

    await product.save();
    console.log('✅ Created Product: Rayban Aviator Classic');
    console.log(`\n✅ Rayban product seeded successfully!`);
    console.log(`   Product ID: ${product._id}`);
    console.log(`   Model ID: ${glassesModel._id}`);
    console.log(`   Slug: ${product.slug}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Rayban:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

main();

