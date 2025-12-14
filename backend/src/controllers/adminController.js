import GlassesModel from '../models/GlassesModel.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { processGLTFModel, updateGLTFTexturePaths } from '../utils/processGLTFModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Add complete glasses package (3D model + product)
 */
export const addCompleteGlassesPackage = async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      originalPrice,
      description,
      category,
      gender,
      frameColor,
      lensColor,
      material,
      frameShape,
      modelName,
    } = req.body;

    if (!name || !brand || !price || !modelName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, brand, price, modelName',
      });
    }

    // Process model files (GLTF/GLB or JSON)
    const modelFiles = {};
    if (req.files.modelFiles) {
      // First pass: identify GLTF/GLB files
      req.files.modelFiles.forEach(file => {
        const filename = file.filename;
        const lowerName = filename.toLowerCase();
        const ext = path.extname(filename).toLowerCase();
        
        // Check for GLTF/GLB files (main model file)
        if (ext === '.gltf' || ext === '.glb') {
          if (!modelFiles.frameGLTF) {
            modelFiles.frameGLTF = `models/glasses/${modelName}/${filename}`;
            // Also set frame for backward compatibility
            modelFiles.frame = `models/glasses/${modelName}/${filename}`;
          }
        }
        // .bin files are handled automatically by GLTF loader, no need to store path
        // Check for JSON files (legacy support)
        else if (ext === '.json') {
          if (lowerName.includes('frame') || lowerName === 'frame.json' || !modelFiles.frame) {
            modelFiles.frame = `models/glasses/${modelName}/${filename}`;
          } else if (lowerName.includes('lens') || lowerName === 'lenses.json') {
            modelFiles.lenses = `models/glasses/${modelName}/${filename}`;
          } else if (lowerName.includes('occluder') || lowerName === 'face.json') {
            modelFiles.occluder = `models/glasses/${modelName}/${filename}`;
          }
        }
      });
    }

    if (!modelFiles.frame && !modelFiles.frameGLTF) {
      return res.status(400).json({
        success: false,
        error: 'Frame model file (GLTF/GLB or JSON) is required',
      });
    }

    // Process texture files
    if (req.files.textureFiles) {
      req.files.textureFiles.forEach(file => {
        const filename = file.filename;
        const lowerName = filename.toLowerCase();
        
        // GLTF baseColor textures (common pattern)
        if (lowerName.includes('basecolor') || lowerName.includes('base_color') || lowerName.includes('diffuse')) {
          // Use first baseColor as frame texture if not set
          if (!modelFiles.frameTexture) {
            modelFiles.frameTexture = `textures/${modelName}/${filename}`;
          }
        }
        
        // Frame textures
        if (lowerName.includes('frame') && (lowerName.includes('texture') || lowerName.includes('diffuse') || lowerName.includes('basecolor'))) {
          modelFiles.frameTexture = `textures/${modelName}/${filename}`;
        } else if (lowerName.includes('frame') && lowerName.includes('normal')) {
          modelFiles.frameNormalMap = `textures/${modelName}/${filename}`;
        } else if (lowerName.includes('frame') && lowerName.includes('rough')) {
          modelFiles.frameRoughnessMap = `textures/${modelName}/${filename}`;
        } else if (lowerName.includes('frame') && lowerName.includes('metal')) {
          modelFiles.frameMetalnessMap = `textures/${modelName}/${filename}`;
        }
        
        // Lens textures
        if (lowerName.includes('lens') && (lowerName.includes('texture') || lowerName.includes('diffuse') || lowerName.includes('basecolor'))) {
          modelFiles.lensTexture = `textures/${modelName}/${filename}`;
        } else if (lowerName.includes('lens') && lowerName.includes('normal')) {
          modelFiles.lensNormalMap = `textures/${modelName}/${filename}`;
        }
      });
      
      // If no specific textures found, use first texture as frame texture
      if (!modelFiles.frameTexture && req.files.textureFiles.length > 0) {
        modelFiles.frameTexture = `textures/${modelName}/${req.files.textureFiles[0].filename}`;
      }
    }

    // Process GLTF model if present
    let modelMetadata = { scale: 1.0, position: { x: 0, y: 0, z: 0.4 }, rotation: { x: 0, y: 0, z: 0 } };
    if (modelFiles.frameGLTF) {
      try {
        const gltfFullPath = path.join(__dirname, '../../public', modelFiles.frameGLTF);
        
        // Update texture paths in GLTF
        updateGLTFTexturePaths(gltfFullPath, modelName);
        
        // Process GLTF to get optimal scale and position
        modelMetadata = await processGLTFModel(gltfFullPath);
        console.log('GLTF processed with metadata:', modelMetadata);
      } catch (error) {
        console.error('Error processing GLTF:', error);
        // Continue with default metadata
      }
    }

    // Create GlassesModel
    const glassesModel = new GlassesModel({
      name: modelName,
      category: category || 'Glasses',
      description: description || '',
      modelFiles,
      modelMetadata,
      isActive: true,
    });

    await glassesModel.save();

    // Process product images
    const productImagePaths = [];
    if (req.files.productImages && req.files.productImages.length > 0) {
      productImagePaths.push(...req.files.productImages.map(file => 
        `images/products/${file.filename}`
      ));
      console.log('📸 Product images saved:', productImagePaths);
    } else {
      console.log('⚠️  No product images uploaded');
    }

    // Create Product
    const product = new Product({
      name,
      brand,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      description,
      category,
      gender,
      frameColor,
      lensColor,
      material,
      frameShape,
      images: productImagePaths, // Save image paths to database
      glassesModelId: glassesModel._id,
      isActive: true,
    });

    await product.save();
    console.log('✅ Product saved to database with images:', product.images);

    res.json({
      success: true,
      data: {
        product,
        glassesModel,
      },
    });
  } catch (error) {
    console.error('Error adding glasses package:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add glasses package',
    });
  }
};

/**
 * Get all products (Admin)
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('glassesModelId')
      .select('+images') // Ensure images field is included
      .sort({ createdAt: -1 });

    // Log images for debugging
    products.forEach(product => {
      console.log(`📦 Product: ${product.name}, Images: ${product.images?.length || 0}`);
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch products',
    });
  }
};

/**
 * Update product
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    const updates = req.body;
    
    // Handle product images if uploaded
    if (req.files && req.files.productImages && req.files.productImages.length > 0) {
      const newImagePaths = req.files.productImages.map(file => 
        `images/products/${file.filename}`
      );
      
      // Add new images to existing ones (or replace if specified)
      if (updates.replaceImages === 'true') {
        product.images = newImagePaths;
        console.log('📸 Replaced product images:', newImagePaths);
      } else {
        product.images = [...(product.images || []), ...newImagePaths];
        console.log('📸 Added product images:', newImagePaths);
      }
      delete updates.replaceImages; // Remove from updates
    }
    
    // Update other fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'images') {
        product[key] = updates[key];
      }
    });

    await product.save();
    console.log('✅ Product updated:', product.name, 'Images:', product.images?.length || 0);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update product',
    });
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete product',
    });
  }
};
