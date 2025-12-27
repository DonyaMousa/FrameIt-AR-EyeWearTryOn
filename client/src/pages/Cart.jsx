import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { API_URL } from "../config/api";
import useStore from "../store/useStore";
import Button from "../components/Button";
import styles from "./Cart.module.css";

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useStore();

  if (cart.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.empty}>
            <h1>Your cart is empty</h1>
            <p>Add some products to get started!</p>
            <Button to="/shop">Shop Now</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Shopping Cart</h1>
        <div className={styles.content}>
          <div className={styles.items}>
            {cart.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={`${API_URL}/static/${item.images[0]}`}
                      alt={item.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML =
                          '<span style="font-size: 2.5rem; opacity: 0.5;">👓</span>';
                      }}
                    />
                  ) : (
                    <span>👓</span>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <h3>{item.name}</h3>
                  <p>{item.price} EGP</p>
                </div>
                <div className={styles.itemQuantity}>
                  <button
                    onClick={() =>
                      updateCartQuantity(
                        item.id,
                        Math.max(1, item.quantity - 1)
                      )
                    }
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateCartQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <div className={styles.itemTotal}>
                  {(item.price * item.quantity).toFixed(2)} EGP
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className={styles.removeButton}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <div className={styles.summary}>
            <h2>Order Summary</h2>
            <div className={styles.total}>
              <span>Total:</span>
              <span>{getCartTotal().toFixed(2)} EGP</span>
            </div>
            <Button to="/checkout" size="lg" className={styles.checkoutButton}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
