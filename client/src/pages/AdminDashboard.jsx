import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Plus, LogOut, Eye, ShoppingCart, Edit, Trash2, DollarSign, Upload } from "lucide-react";
import { API_URL } from "../config/api";
import useAuthStore from "../store/authStore";
import Button from "../components/Button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, adminToken, logout, clearAdmin } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tokenLoaded, setTokenLoaded] = useState(false);

  // Wait for token to be loaded from localStorage
  useEffect(() => {
    // Check localStorage directly to ensure token is loaded
    const checkToken = () => {
      try {
        const stored = localStorage.getItem("auth-storage");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.adminToken) {
            console.log("Admin token found in localStorage");
            // Update store if it's not already set
            if (!adminToken) {
              useAuthStore.setState({ adminToken: parsed.adminToken, admin: parsed.admin });
            }
            setTokenLoaded(true);
            return;
          }
        }
      } catch (err) {
        console.error("Error reading token:", err);
      }
      // If no token found, redirect to sign in (only if we're still on admin dashboard)
      if (!adminToken && window.location.pathname.startsWith("/admin")) {
        console.log("No admin token found, redirecting to sign in");
        navigate("/admin/signin", { replace: true });
      } else {
        setTokenLoaded(true);
      }
    };

    // Small delay to ensure localStorage is accessible
    const timer = setTimeout(checkToken, 50);
    return () => clearTimeout(timer);
  }, [adminToken, navigate]);

  useEffect(() => {
    if (!tokenLoaded) return;
    
    if (!adminToken) {
      navigate("/admin/signin", { replace: true });
      return;
    }

    if (activeTab === "products") {
      fetchProducts();
    } else {
      fetchOrders();
    }
  }, [activeTab, adminToken, navigate, tokenLoaded]);

  const fetchProducts = async () => {
    // Get fresh token from store
    const currentToken = useAuthStore.getState().adminToken;
    
    if (!currentToken) {
      setError("Authentication required. Please sign in again.");
      setLoading(false);
      navigate("/admin/signin", { replace: true });
      return;
    }

    try {
      // Ensure token is clean (no extra spaces)
      const cleanToken = currentToken.trim();
      console.log("Sending request with token:", cleanToken.substring(0, 20) + "...");
      
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.log("Error response:", errorData);
        console.log("Token that failed:", cleanToken.substring(0, 50) + "...");
        
        if (response.status === 401) {
          setError(errorData.error || "Authentication failed. Please sign in again.");
          setTimeout(() => {
            navigate("/admin/signin");
          }, 2000);
        } else {
          setError(errorData.error || "Failed to load products");
        }
      } else {
        const data = await response.json();
        if (data.success) {
          setProducts(data.data || []);
        }
      }
    } catch (err) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    // Get fresh token from store
    const currentToken = useAuthStore.getState().adminToken;
    
    if (!currentToken) {
      setError("Authentication required. Please sign in again.");
      setLoading(false);
      navigate("/admin/signin", { replace: true });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders/admin`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const currentToken = useAuthStore.getState().adminToken;
      if (!currentToken) {
        navigate("/admin/signin", { replace: true });
        return;
      }

      const response = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p._id !== productId));
      }
    } catch (err) {
      setError("Failed to delete product");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const currentToken = useAuthStore.getState().adminToken;
      if (!currentToken) {
        navigate("/admin/signin", { replace: true });
        return;
      }

      const response = await fetch(`${API_URL}/orders/admin/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (err) {
      setError("Failed to update order status");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    // Clear admin state
    clearAdmin();
    logout();
    // Use window.location for full page navigation to bypass ProtectedRoute
    window.location.href = "/";
  };

  if (!tokenLoaded) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin && !adminToken) {
    return null;
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {admin.name || admin.email}</p>
          </div>
          <div className={styles.headerActions}>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <Package size={24} />
            <div>
              <h3>{products.length}</h3>
              <p>Products</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <ShoppingCart size={24} />
            <div>
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <DollarSign size={24} />
            <div>
              <h3>{totalRevenue.toFixed(2)} EGP</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <ShoppingCart size={24} />
            <div>
              <h3>{pendingOrders}</h3>
              <p>Pending Orders</p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/admin/add-glasses">
            <Button size="lg">
              <Plus size={20} />
              Add New Glasses
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "products" ? styles.active : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={`${styles.tab} ${activeTab === "orders" ? styles.active : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "products" ? (
            <div className={styles.section}>
              <h2>Products ({products.length})</h2>
              {loading ? (
                <p>Loading products...</p>
              ) : error ? (
                <div className={styles.error}>{error}</div>
              ) : products.length === 0 ? (
                <div className={styles.empty}>
                  <Package size={48} />
                  <p>No products yet</p>
                  <Link to="/admin/add-glasses">
                    <Button>Add Your First Product</Button>
                  </Link>
                </div>
              ) : (
                <div className={styles.productsGrid}>
                  {products.map((product) => (
                    <motion.div
                      key={product._id}
                      className={styles.productCard}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={styles.productImage}>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={`${API_URL}/static/${product.images[0]}`}
                            alt={product.name}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML = '<div class="' + styles.noImage + '">👓</div>';
                            }}
                          />
                        ) : (
                          <div className={styles.noImage}>👓</div>
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <h3>{product.name}</h3>
                        <p className={styles.brand}>{product.brand}</p>
                        <div className={styles.productMeta}>
                          <span className={styles.category}>{product.category}</span>
                          <span className={styles.gender}>{product.gender}</span>
                        </div>
                        <div className={styles.productDetails}>
                          {product.frameColor && (
                            <span className={styles.detail}>
                              <strong>Frame:</strong> {product.frameColor}
                            </span>
                          )}
                          {product.lensColor && (
                            <span className={styles.detail}>
                              <strong>Lens:</strong> {product.lensColor}
                            </span>
                          )}
                          {product.material && (
                            <span className={styles.detail}>
                              <strong>Material:</strong> {product.material}
                            </span>
                          )}
                        </div>
                        <p className={styles.price}>{product.price} EGP</p>
                        {product.glassesModelId?.modelFiles && (
                          <div className={styles.modelInfo}>
                            <span className={styles.modelBadge}>
                              {product.glassesModelId.modelFiles.frameGLTF ? '3D GLTF' : '3D JSON'}
                            </span>
                            {product.glassesModelId.modelMetadata && (
                              <span className={styles.scaleBadge}>
                                Scale: {product.glassesModelId.modelMetadata.scale?.toFixed(2) || '1.00'}
                              </span>
                            )}
                          </div>
                        )}
                        <div className={styles.productActions}>
                          <Link to={`/product/${product.slug}`}>
                            <Button variant="outline" size="sm">
                              <Eye size={16} />
                              View
                            </Button>
                          </Link>
                          <Link to={`/try-on/${product._id}`}>
                            <Button variant="outline" size="sm">
                              Try On
                            </Button>
                          </Link>
                          <Link to={`/admin/products/${product._id}/images`}>
                            <Button variant="outline" size="sm">
                              <Upload size={16} />
                              Images
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 size={16} />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.section}>
              <h2>Orders ({orders.length})</h2>
              {loading ? (
                <p>Loading orders...</p>
              ) : error ? (
                <div className={styles.error}>{error}</div>
              ) : orders.length === 0 ? (
                <div className={styles.empty}>
                  <ShoppingCart size={48} />
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className={styles.ordersList}>
                  {orders.map((order) => (
                    <motion.div
                      key={order._id}
                      className={styles.orderCard}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={styles.orderHeader}>
                        <div>
                          <h3>Order #{order.orderNumber}</h3>
                          <p className={styles.orderDate}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={styles.orderStatus}>
                          <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                            {order.status}
                          </span>
                          <span className={styles.totalAmount}>{order.total?.toFixed(2)} EGP</span>
                        </div>
                      </div>
                      <div className={styles.orderDetails}>
                        <div>
                          <strong>Customer:</strong>{" "}
                          {order.user?.firstName} {order.user?.lastName}
                        </div>
                        <div>
                          <strong>Items:</strong> {order.items?.length || 0}
                        </div>
                        <div>
                          <strong>Payment:</strong> {order.paymentStatus}
                        </div>
                      </div>
                      <div className={styles.orderActions}>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className={styles.statusSelect}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
