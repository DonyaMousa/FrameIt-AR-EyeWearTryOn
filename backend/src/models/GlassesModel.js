import mongoose from "mongoose";

const GlassesModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Glasses",
    },
    description: {
      type: String,
    },
    modelFiles: {
      frame: {
        type: String,
        required: true,
      },
      frameGLTF: {
        type: String, // GLTF/GLB file path
      },
      lenses: {
        type: String,
      },
      occluder: {
        type: String,
      },
      envMap: {
        type: String,
      },
      // Frame textures
      frameTexture: {
        type: String,
      },
      frameNormalMap: {
        type: String,
      },
      frameRoughnessMap: {
        type: String,
      },
      frameMetalnessMap: {
        type: String,
      },
      // Lens textures
      lensTexture: {
        type: String,
      },
      lensNormalMap: {
        type: String,
      },
    },
    // 3D Model metadata for proper scaling
    modelMetadata: {
      scale: {
        type: Number,
        default: 1.0,
      },
      position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0.4 },
      },
      rotation: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
GlassesModelSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    const slugify = (text) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
    };
    this.slug = slugify(this.name);
  }
  next();
});

export default mongoose.model("GlassesModel", GlassesModelSchema);
