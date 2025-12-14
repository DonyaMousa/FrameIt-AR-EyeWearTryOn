import fs from 'fs';
import path from 'path';

/**
 * Process GLTF model and calculate optimal scale and position
 * @param {string} gltfPath - Path to GLTF file
 * @returns {Promise<Object>} - Model metadata with scale and position
 */
export async function processGLTFModel(gltfPath) {
  try {
    // Read and parse GLTF file
    const gltfData = fs.readFileSync(gltfPath, 'utf8');
    const gltf = JSON.parse(gltfData);
    
    // Calculate bounding box from GLTF data
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    // Parse meshes and their positions
    if (gltf.meshes && gltf.accessors && gltf.bufferViews) {
      for (const mesh of gltf.meshes) {
        for (const primitive of mesh.primitives) {
          const positionAccessor = gltf.accessors[primitive.attributes.POSITION];
          if (positionAccessor) {
            // Get min/max from accessor
            if (positionAccessor.min) {
              minX = Math.min(minX, positionAccessor.min[0]);
              minY = Math.min(minY, positionAccessor.min[1]);
              minZ = Math.min(minZ, positionAccessor.min[2]);
            }
            if (positionAccessor.max) {
              maxX = Math.max(maxX, positionAccessor.max[0]);
              maxY = Math.max(maxY, positionAccessor.max[1]);
              maxZ = Math.max(maxZ, positionAccessor.max[2]);
            }
          }
        }
      }
    }
    
    // Calculate size and center
    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const sizeZ = maxZ - minZ;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + minZ) / 2;
    
    // Calculate optimal scale for glasses (target width: 14cm = 0.14 units)
    const targetWidth = 0.14;
    const maxDimension = Math.max(sizeX, sizeY, sizeZ);
    const optimalScale = maxDimension > 0 ? targetWidth / maxDimension : 1.0;
    
    // Calculate position offset to center the model
    const positionOffset = {
      x: -centerX * optimalScale,
      y: -centerY * optimalScale,
      z: 0.4, // Distance from face
    };
    
    const metadata = {
      scale: optimalScale,
      position: positionOffset,
      rotation: { x: 0, y: 0, z: 0 },
      boundingBox: {
        min: { x: minX, y: minY, z: minZ },
        max: { x: maxX, y: maxY, z: maxZ },
        size: { x: sizeX, y: sizeY, z: sizeZ },
        center: { x: centerX, y: centerY, z: centerZ },
      },
    };
    
    return metadata;
  } catch (error) {
    console.error('Error processing GLTF:', error);
    // Return default metadata on error
    return {
      scale: 1.0,
      position: { x: 0, y: 0, z: 0.4 },
      rotation: { x: 0, y: 0, z: 0 },
    };
  }
}

/**
 * Update GLTF texture paths to use absolute URLs
 * @param {string} gltfPath - Path to GLTF file
 * @param {string} modelName - Model name for URL construction
 */
export function updateGLTFTexturePaths(gltfPath, modelName) {
  try {
    const gltfData = fs.readFileSync(gltfPath, 'utf8');
    const gltf = JSON.parse(gltfData);
    
    // Update image URIs to use absolute paths
    if (gltf.images) {
      gltf.images = gltf.images.map(image => {
        if (image.uri && !image.uri.startsWith('http') && !image.uri.startsWith('/')) {
          // Convert relative path to absolute
          const fileName = path.basename(image.uri);
          image.uri = `/api/static/textures/${modelName}/${fileName}`;
        }
        return image;
      });
    }
    
    // Write back the updated GLTF
    fs.writeFileSync(gltfPath, JSON.stringify(gltf, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error updating GLTF texture paths:', error);
    return false;
  }
}

