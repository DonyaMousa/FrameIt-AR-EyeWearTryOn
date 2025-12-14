import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
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
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      default: "Sunglasses",
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Kids"],
      default: "Unisex",
    },
    frameColor: {
      type: String,
    },
    lensColor: {
      type: String,
    },
    material: {
      type: String,
    },
    frameShape: {
      type: String,
    },
    images: [
      {
        type: String,
        required: false,
      },
    ],
    glassesModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GlassesModel",
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
ProductSchema.pre("save", function (next) {
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

export default mongoose.model("Product", ProductSchema);
