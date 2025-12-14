import { Link } from "react-router-dom";
import { ShoppingBag, User, LogOut } from "lucide-react";
import useStore from "../store/useStore";
import useAuthStore from "../store/authStore";
import logoImage from "../assets/frameitlogo.png";
import styles from "./Header.module.css";

export default function Header() {
  const { cart } = useStore();
  const { user, admin, logout, clearUser, clearAdmin } = useAuthStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    clearUser();
    clearAdmin();
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.content}>
          <Link to="/" className={styles.logo}>
            <img src={logoImage} alt="FrameIt" className={styles.logoImage} />
            <span className={styles.logoText}>FrameIt</span>
          </Link>

          <nav className={styles.nav}>
            <Link to="/" className={styles.navLink}>
              Home
            </Link>
            <Link to="/shop" className={styles.navLink}>
              Shop
            </Link>
            <Link to="/try-on" className={styles.navLink}>
              Try On
            </Link>
          </nav>

          <div className={styles.actions}>
            {admin ? (
              <Link to="/admin/dashboard" className={styles.userButton}>
                <User size={18} />
                <span>Admin</span>
              </Link>
            ) : user ? (
              <div className={styles.userMenu}>
                <Link to="/orders" className={styles.userButton}>
                  <User size={18} />
                  <span>{user.firstName || user.email}</span>
                </Link>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link to="/signin" className={styles.authLink}>
                  Sign In
                </Link>
                <Link to="/signup" className={styles.authButton}>
                  Sign Up
                </Link>
              </>
            )}
            <Link to="/cart" className={styles.cartButton}>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
