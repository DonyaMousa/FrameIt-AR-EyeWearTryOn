import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const modelsDir = path.join(__dirname, "../public/models/glasses");
const imagesDir = path.join(__dirname, "../public/images/products");
const texturesDir = path.join(__dirname, "../public/textures");

[modelsDir, imagesDir, texturesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for model files
const modelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const modelName = req.body.modelName || "default";
    const modelDir = path.join(modelsDir, modelName);

    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true });
    }

    cb(null, modelDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename for JSON files
    cb(null, file.originalname);
  },
});

// Storage configuration for texture files
const textureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const modelName = req.body.modelName || "default";
    const textureModelDir = path.join(texturesDir, modelName);

    if (!fs.existsSync(textureModelDir)) {
      fs.mkdirSync(textureModelDir, { recursive: true });
    }

    cb(null, textureModelDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Storage configuration for product images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filters
const modelFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = [".json", ".gltf", ".glb", ".bin"];
  const allowedMimes = [
    "application/json",
    "model/gltf+json",
    "model/gltf-binary",
    "application/octet-stream",
  ];

  if (allowedTypes.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JSON, GLTF, GLB, or BIN files are allowed for model files"
      ),
      false
    );
  }
};

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Multer instances
export const uploadModelFiles = multer({
  storage: modelStorage,
  fileFilter: modelFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadTextureFiles = multer({
  storage: textureStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadProductImages = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Combined upload for complete glasses package
export const uploadGlassesPackage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const modelName = req.body.modelName || "default";

      if (file.fieldname === "modelFiles") {
        const modelDir = path.join(modelsDir, modelName);
        if (!fs.existsSync(modelDir)) {
          fs.mkdirSync(modelDir, { recursive: true });
        }
        cb(null, modelDir);
      } else if (file.fieldname === "textureFiles") {
        const textureModelDir = path.join(texturesDir, modelName);
        if (!fs.existsSync(textureModelDir)) {
          fs.mkdirSync(textureModelDir, { recursive: true });
        }
        cb(null, textureModelDir);
      } else if (file.fieldname === "productImages") {
        cb(null, imagesDir);
      } else {
        cb(new Error("Invalid field name"), null);
      }
    },
    filename: (req, file, cb) => {
      if (file.fieldname === "productImages") {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      } else {
        cb(null, file.originalname);
      }
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "modelFiles") {
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedTypes = [".json", ".gltf", ".glb", ".bin"];
      const allowedMimes = [
        "application/json",
        "model/gltf+json",
        "model/gltf-binary",
        "application/octet-stream",
      ];

      if (allowedTypes.includes(ext) || allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Model files must be JSON, GLTF, GLB, or BIN"), false);
      }
    } else if (
      file.fieldname === "textureFiles" ||
      file.fieldname === "productImages"
    ) {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Texture and product images must be image files"), false);
      }
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
