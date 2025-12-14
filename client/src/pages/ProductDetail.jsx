import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingBag, Camera } from "lucide-react";
import { API_URL } from "../config/api";
import useStore from "../store/useStore";
import Button from "../components/Button";
import styles from "./ProductDetail.module.css";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/products/${slug}`);
        const data = await response.json();
        setProduct(data.data || data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) return <div className={styles.page}>Loading...</div>;
  if (!product) return <div className={styles.page}>Product not found</div>;

  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/shop" className={styles.backLink}>
          ← Back to Shop
        </Link>
        <div className={styles.content}>
          <div className={styles.imageSection}>
            <div className={styles.image}>
              {product.images && product.images.length > 0 ? (
                <img
                  src={`${API_URL}/static/${product.images[0]}`}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    console.error("Image failed to load:", e.target.src);
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      '<div style="font-size: 6rem; display: flex; align-items: center; justify-content: center; height: 100%;">👓</div>';
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: "6rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  👓
                </div>
              )}
            </div>
          </div>
          <div className={styles.infoSection}>
            <h1>{product.name}</h1>
            <p className={styles.brand}>{product.brand}</p>
            <p className={styles.price}>${product.price}</p>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.actions}>
              <Button
                onClick={() => addToCart(product)}
                icon={<ShoppingBag size={20} />}
                size="lg"
              >
                Add to Cart
              </Button>
              <Button
                to={`/try-on/${product._id || product.id}`}
                variant="outline"
                icon={<Camera size={20} />}
                size="lg"
              >
                Try On
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
