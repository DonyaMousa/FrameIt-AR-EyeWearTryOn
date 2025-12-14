import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>FrameIt</h3>
            <p>AR-powered virtual try-on for eyewear</p>
          </div>
          <div className={styles.section}>
            <h4>Quick Links</h4>
            <Link to="/shop">Shop</Link>
            <Link to="/try-on">Try On</Link>
            <Link to="/cart">Cart</Link>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>&copy; 2024 FrameIt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
