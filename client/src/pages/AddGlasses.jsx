import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Package, Image as ImageIcon, DollarSign } from "lucide-react";
import { API_URL } from "../config/api";
import useAuthStore from "../store/authStore";
import Button from "../components/Button";
import styles from "./AddGlasses.module.css";

export default function AddGlasses() {
  const navigate = useNavigate();
  const { adminToken } = useAuthStore();

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/signin", { replace: true });
    }
  }, [adminToken, navigate]);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    originalPrice: "",
    description: "",
    category: "Sunglasses",
    gender: "Unisex",
    frameColor: "",
    lensColor: "",
    material: "Metal",
    frameShape: "Aviator",
    modelName: "",
  });
  const [modelFiles, setModelFiles] = useState([]);
  const [textureFiles, setTextureFiles] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleModelFiles = (e) => {
    setModelFiles(Array.from(e.target.files));
  };

  const handleTextureFiles = (e) => {
    setTextureFiles(Array.from(e.target.files));
  };

  const handleProductImages = (e) => {
    setProductImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Get fresh token from store
    const currentToken = useAuthStore.getState().adminToken;
    
    if (!currentToken) {
      setError("You must be logged in as admin to add glasses. Please sign in again.");
      setIsLoading(false);
      navigate("/admin/signin", { replace: true });
      return;
    }

    if (
      !formData.name ||
      !formData.brand ||
      !formData.price ||
      !formData.modelName
    ) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (modelFiles.length === 0) {
      setError("Please upload at least one model file (GLTF/GLB or JSON)");
      setIsLoading(false);
      return;
    }

    try {
      const data = new FormData();

      // Add form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      // Add model files (JSON only)
      modelFiles.forEach((file) => {
        data.append("modelFiles", file);
      });

      // Add texture files
      textureFiles.forEach((file) => {
        data.append("textureFiles", file);
      });

      // Add product images
      productImages.forEach((file) => {
        data.append("productImages", file);
      });

      const response = await fetch(`${API_URL}/admin/glasses/add-complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authentication failed. Please sign in again.");
          setTimeout(() => {
            navigate("/admin/signin");
          }, 2000);
        } else {
          setError(result.error || result.message || "Failed to add glasses");
        }
        setIsLoading(false);
        return;
      }

      setSuccess("Glasses added successfully!");
      // Reset form
      setFormData({
        name: "",
        brand: "",
        price: "",
        originalPrice: "",
        description: "",
        category: "Sunglasses",
        gender: "Unisex",
        frameColor: "",
        lensColor: "",
        material: "Metal",
        frameShape: "Aviator",
        modelName: "",
      });
      setModelFiles([]);
      setTextureFiles([]);
      setProductImages([]);
      setIsLoading(false);
    } catch (error) {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1>Add 3D Glasses</h1>
          <p>Upload 3D model files and product information</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.section}>
            <h2>
              <Package size={20} />
              Product Information
            </h2>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ray-Ban Aviator Classic"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  placeholder="Ray-Ban"
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Price (EGP) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  placeholder="154.00"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Original Price (EGP)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="180.00"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Product description..."
              />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="Sunglasses">Sunglasses</option>
                  <option value="Optical">Optical</option>
                  <option value="Sports">Sports</option>
                  <option value="Reading">Reading</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Frame Color</label>
                <input
                  type="text"
                  name="frameColor"
                  value={formData.frameColor}
                  onChange={handleInputChange}
                  placeholder="Gold"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Lens Color</label>
                <input
                  type="text"
                  name="lensColor"
                  value={formData.lensColor}
                  onChange={handleInputChange}
                  placeholder="Green"
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>
              <Upload size={20} />
              3D Model Files *
            </h2>
            <div className={styles.inputGroup}>
              <label>Upload 3D Model Files *</label>
              <p className={styles.helpText}>
                <strong>For GLTF models:</strong> Upload <code>scene.gltf</code> (or any .gltf/.glb file), <code>scene.bin</code> (if exists), and all texture files together.
                <br />
                <strong>Tip:</strong> You can select multiple files at once (hold Ctrl/Cmd and click).
                <br />
                <strong>Supported formats:</strong> .gltf, .glb, .bin, .json
              </p>
              <input
                type="file"
                accept=".gltf,.glb,.json,.bin"
                multiple
                onChange={handleModelFiles}
                required
              />
              {modelFiles.length > 0 && (
                <div className={styles.fileList}>
                  {modelFiles.map((file, index) => (
                    <div key={index} className={styles.fileItem}>
                      <span className={styles.fileName}>{file.name}</span>
                      <span className={styles.fileSize}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2>
              <ImageIcon size={20} />
              Texture Files
            </h2>
            <div className={styles.inputGroup}>
              <label>Upload Texture Images (Optional)</label>
              <p className={styles.helpText}>
                Upload texture images from your GLTF model folder (baseColor, normal, roughness, metalness maps).
                <br />
                Textures are automatically detected based on filename patterns.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleTextureFiles}
              />
              {textureFiles.length > 0 && (
                <div className={styles.fileList}>
                  {textureFiles.map((file, index) => (
                    <div key={index} className={styles.fileItem}>
                      <span className={styles.fileName}>{file.name}</span>
                      <span className={styles.fileSize}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2>
              <ImageIcon size={20} />
              Product Images
            </h2>
            <div className={styles.inputGroup}>
              <label>Upload product images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleProductImages}
              />
              {productImages.length > 0 && (
                <p className={styles.fileInfo}>
                  {productImages.length} image(s) selected
                </p>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2>
              <DollarSign size={20} />
              Model Settings
            </h2>
            <div className={styles.inputGroup}>
              <label>Model Name *</label>
              <input
                type="text"
                name="modelName"
                value={formData.modelName}
                onChange={handleInputChange}
                required
                placeholder="rayban-aviator"
              />
              <p className={styles.helpText}>
                This will be used as the folder name for storing model files
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Glasses"}
          </Button>
        </form>
      </div>
    </div>
  );
}
