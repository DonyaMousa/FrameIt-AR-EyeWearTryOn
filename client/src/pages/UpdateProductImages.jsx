import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { API_URL } from "../config/api";
import useAuthStore from "../store/authStore";
import Button from "../components/Button";
import styles from "./AddGlasses.module.css";

export default function UpdateProductImages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminToken } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/signin", { replace: true });
      return;
    }

    // Fetch product details
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/products`, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          const foundProduct = data.data.find((p) => p._id === id);
          if (foundProduct) {
            setProduct(foundProduct);
          } else {
            setError("Product not found");
          }
        }
      } catch (err) {
        setError("Failed to load product");
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, adminToken, navigate]);

  const handleProductImages = (e) => {
    setProductImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (productImages.length === 0) {
      setError("Please select at least one image");
      setIsLoading(false);
      return;
    }

    try {
      const currentToken = useAuthStore.getState().adminToken;
      if (!currentToken) {
        navigate("/admin/signin", { replace: true });
        return;
      }

      const data = new FormData();
      productImages.forEach((file) => {
        data.append("productImages", file);
      });
      data.append("replaceImages", "false"); // Add to existing images

      const response = await fetch(`${API_URL}/admin/products/${id}`, {
        method: "PATCH",
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
          setError(result.error || "Failed to update product images");
        }
        setIsLoading(false);
        return;
      }

      setSuccess("Product images updated successfully!");
      setProductImages([]);
      // Refresh product data
      const refreshResponse = await fetch(`${API_URL}/admin/products`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
      });
      const refreshData = await refreshResponse.json();
      if (refreshData.success) {
        const updatedProduct = refreshData.data.find((p) => p._id === id);
        if (updatedProduct) {
          setProduct(updatedProduct);
        }
      }
      setIsLoading(false);
    } catch (error) {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  if (!product) {
    return (
      <div className={styles.page}>
        <div className="container">
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1>Update Product Images</h1>
          <p>{product.name}</p>
        </div>

        {product.images && product.images.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h3>Current Images:</h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {product.images.map((img, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={`${API_URL}/static/${img}`}
                    alt={`Product ${index + 1}`}
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.section}>
            <h2>
              <Upload size={20} />
              Upload New Product Images
            </h2>
            <div className={styles.inputGroup}>
              <label>Select Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleProductImages}
                required
              />
              {productImages.length > 0 && (
                <p className={styles.fileInfo}>
                  {productImages.length} image(s) selected
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <Button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Add Images"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

