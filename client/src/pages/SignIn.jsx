import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, User, Shield } from "lucide-react";
import { API_URL } from "../config/api";
import useAuthStore from "../store/authStore";
import Button from "../components/Button";
import styles from "./SignIn.module.css";

export default function SignIn() {
  const navigate = useNavigate();
  const { setUserToken, setUser, setAdminToken, setAdmin } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isAdmin
        ? `${API_URL}/auth/admin/login`
        : `${API_URL}/auth/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Login failed");
        setIsLoading(false);
        return;
      }

      if (isAdmin) {
        // Store admin token and admin data
        setAdminToken(result.data.token);
        setAdmin(result.data.admin);
        // Verify token was saved before navigating
        const savedToken = localStorage.getItem("auth-storage");
        if (savedToken) {
          const parsed = JSON.parse(savedToken);
          if (parsed.adminToken) {
            console.log("Admin token saved successfully");
          }
        }
        // Small delay to ensure state is saved
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 100);
      } else {
        // Store user token and user data
        setUserToken(result.data.token);
        setUser(result.data.user);
        navigate("/");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.header}>
            <div className={styles.icon}>
              {isAdmin ? <Shield size={32} /> : <Lock size={32} />}
            </div>
            <h1>{isAdmin ? "Admin Sign In" : "Sign In"}</h1>
            <p>
              {isAdmin ? "Access the admin panel" : "Welcome back to FrameIt"}
            </p>
          </div>

          {/* Toggle between User and Admin */}
          <div className={styles.toggleContainer}>
            <button
              type="button"
              className={`${styles.toggleButton} ${
                !isAdmin ? styles.active : ""
              }`}
              onClick={() => setIsAdmin(false)}
            >
              <User size={16} />
              User
            </button>
            <button
              type="button"
              className={`${styles.toggleButton} ${
                isAdmin ? styles.active : ""
              }`}
              onClick={() => setIsAdmin(true)}
            >
              <Shield size={16} />
              Admin
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">
                <Mail size={18} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={isAdmin ? "admin@example.com" : "your@email.com"}
                autoComplete="email"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.spinner} size={20} />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {!isAdmin && (
              <p className={styles.signupLink}>
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
