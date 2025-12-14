import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, ShoppingBag, Sparkles } from "lucide-react";
import Button from "../components/Button";
import { API_URL } from "../config/api";
import { useEffect, useState } from "react";
import styles from "./Home.module.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products?limit=6`);
        const data = await response.json();
        setProducts(data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={styles.heroTitle}>
              Try Before You Buy
              <br />
              <span className={styles.heroHighlight}>AR Virtual Try-On</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Experience the future of eyewear shopping with our advanced AR
              technology. See how glasses look on you in real-time before
              purchasing.
            </p>
            <div className={styles.heroActions}>
              <Button to="/try-on" size="lg" icon={<Camera size={20} />}>
                Start Try-On
              </Button>
              <Button
                to="/shop"
                variant="outline"
                size="lg"
                icon={<ShoppingBag size={20} />}
              >
                Shop Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <Camera size={32} />
              <h3>AR Try-On</h3>
              <p>Real-time 3D face tracking</p>
            </div>
            <div className={styles.feature}>
              <Sparkles size={32} />
              <h3>Premium Quality</h3>
              <p>High-end eyewear brands</p>
            </div>
            <div className={styles.feature}>
              <ShoppingBag size={32} />
              <h3>Easy Shopping</h3>
              <p>Seamless checkout experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.products}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Featured Products</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : products.length > 0 ? (
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <Link
                  key={product._id || product.id}
                  to={`/product/${product.slug || product._id}`}
                  className={styles.productCard}
                >
                  <div className={styles.productImage}>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`${API_URL}/static/${product.images[0]}`}
                        alt={product.name}
                        onError={(e) => {
                          console.error("Image failed to load:", e.target.src);
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<div style="font-size: 4rem; display: flex; align-items: center; justify-content: center; height: 100%;">👓</div>';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: "4rem",
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
                  <div className={styles.productInfo}>
                    <h3>{product.name}</h3>
                    <p className={styles.productBrand}>{product.brand}</p>
                    <p className={styles.productPrice}>${product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No products available yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
