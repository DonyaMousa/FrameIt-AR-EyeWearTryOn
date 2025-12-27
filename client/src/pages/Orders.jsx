import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { API_URL } from '../config/api';
import useAuthStore from '../store/authStore';
import styles from './Orders.module.css';

export default function Orders() {
  const navigate = useNavigate();
  const { userToken, isUserAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isUserAuthenticated()) {
      navigate('/signin', { replace: true });
      return;
    }
    fetchOrders();
  }, [userToken, navigate, isUserAuthenticated]);

  const fetchOrders = async () => {
    if (!userToken) {
      setError('Please sign in to view your orders');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders/my`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
        console.log('✅ Fetched orders:', data.data?.length || 0);
      } else {
        setError(data.error || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} />;
      case 'processing':
      case 'shipped':
        return <Package size={20} />;
      case 'delivered':
        return <CheckCircle size={20} />;
      case 'cancelled':
        return <XCircle size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'processing':
        return styles.statusProcessing;
      case 'shipped':
        return styles.statusShipped;
      case 'delivered':
        return styles.statusDelivered;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.loading}>Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.empty}>
            <Package size={64} />
            <h2>No orders yet</h2>
            <p>Start shopping to see your orders here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>My Orders</h1>
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3>Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}</h3>
                  <p className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className={`${styles.status} ${getStatusClass(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </div>
              </div>

              <div className={styles.orderItems}>
                {order.items.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <div className={styles.itemImage}>
                      {item.product?.images?.[0] ? (
                        <img
                          src={`${API_URL}/static/${item.product.images[0]}`}
                          alt={item.product.name}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = '<div style="font-size: 2rem;">👓</div>';
                          }}
                        />
                      ) : (
                        <span>👓</span>
                      )}
                    </div>
                    <div className={styles.itemDetails}>
                      <h4>{item.product?.name || 'Product'}</h4>
                      <p>{item.product?.brand}</p>
                      <p className={styles.itemQuantity}>Qty: {item.quantity}</p>
                    </div>
                    <div className={styles.itemPrice}>
                      {(item.price * item.quantity).toFixed(2)} EGP
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.orderTotal}>
                  <span>Total:</span>
                  <span className={styles.totalAmount}>{order.total.toFixed(2)} EGP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

