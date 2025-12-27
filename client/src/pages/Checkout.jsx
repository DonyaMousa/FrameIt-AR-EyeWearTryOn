import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Truck, Shield, Check, Lock } from 'lucide-react';
import { API_URL } from '../config/api';
import useStore from '../store/useStore';
import useAuthStore from '../store/authStore';
import Button from '../components/Button';
import styles from './Checkout.module.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useStore();
  const { userToken } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  const subtotal = getCartTotal();
  const shipping = subtotal >= 5000 ? 0 : 300;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      // Create order
      const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zip,
        country: formData.country,
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          items: orderItems,
          shippingAddress,
          paymentMethod: 'credit_card',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Order creation failed:', result);
        throw new Error(result.error || result.message || 'Failed to create order');
      }

      console.log('✅ Order created successfully:', result.data);
      setOrderNumber(result.data?.orderNumber || result.data?.order?.orderNumber || `ORD-${Date.now()}`);
      setIsProcessing(false);
      setOrderComplete(true);
      clearCart();
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to process order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.empty}>
            <h1>Your cart is empty</h1>
            <p>Add some products before checking out.</p>
            <Button to="/shop">Shop Now</Button>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className={styles.page}>
        <div className="container">
          <motion.div 
            className={styles.success}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.successIcon}>
              <Check size={48} />
            </div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase. Your order has been placed successfully.</p>
            <p className={styles.orderNumber}>Order #{orderNumber || `FRM-${Date.now().toString().slice(-8)}`}</p>
            <p className={styles.successNote}>
              A confirmation email has been sent to {formData.email || 'your email address'}.
            </p>
            <div className={styles.successActions}>
              <Button to="/shop" variant="outline">Continue Shopping</Button>
              <Button to="/">Back to Home</Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Contact' },
    { num: 2, label: 'Shipping' },
    { num: 3, label: 'Payment' },
  ];

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <Link to="/cart" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back to Cart
          </Link>
          <h1 className={styles.title}>Checkout</h1>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* Progress Steps */}
        <div className={styles.progress}>
          {steps.map((s, i) => (
            <div 
              key={s.num} 
              className={`${styles.step} ${step >= s.num ? styles.active : ''} ${step > s.num ? styles.completed : ''}`}
            >
              <div className={styles.stepNumber}>
                {step > s.num ? <Check size={16} /> : s.num}
              </div>
              <span className={styles.stepLabel}>{s.label}</span>
              {i < steps.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        <div className={styles.grid}>
          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Step 1: Contact */}
            {step === 1 && (
              <motion.div 
                className={styles.formSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className={styles.sectionTitle}>Contact Information</h2>
                <div className={styles.field}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <motion.div 
                className={styles.formSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className={styles.sectionTitle}>Shipping Address</h2>
                <div className={styles.field}>
                  <label htmlFor="address">Street Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="NY"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="zip">ZIP Code</label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div 
                className={styles.formSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className={styles.sectionTitle}>
                  <CreditCard size={20} />
                  Payment Details
                </h2>
                <div className={styles.field}>
                  <label htmlFor="cardName">Name on Card</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="Any card number for testing (e.g., 4242 4242 4242 4242)"
                    maxLength={19}
                    required
                  />
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    For testing: Any card number is accepted
                  </small>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="expiry">Expiry Date</label>
                    <input
                      type="text"
                      id="expiry"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                <div className={styles.secure}>
                  <Lock size={16} />
                  Your payment information is secure and encrypted
                </div>
              </motion.div>
            )}

            <div className={styles.formActions}>
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              <Button 
                type="submit" 
                size="lg"
                loading={isProcessing}
                className={styles.submitBtn}
              >
                {step < 3 ? 'Continue' : `Pay ${total.toFixed(2)} EGP`}
              </Button>
            </div>
          </form>

          {/* Order Summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            
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
                          e.target.parentElement.innerHTML = '<span>👓</span>';
                        }}
                      />
                    ) : (
                      <span>👓</span>
                    )}
                    {item.quantity > 1 && (
                      <span className={styles.itemQty}>{item.quantity}</span>
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemMeta}>{item.frameColor || item.brand || ''}</span>
                  </div>
                  <span className={styles.itemPrice}>
                    {(item.price * item.quantity).toFixed(2)} EGP
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.breakdown}>
              <div className={styles.breakdownRow}>
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} EGP</span>
              </div>
              <div className={styles.breakdownRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `${shipping.toFixed(2)} EGP`}</span>
              </div>
              <div className={styles.breakdownRow}>
                <span>Tax</span>
                <span>{tax.toFixed(2)} EGP</span>
              </div>
            </div>

            <div className={styles.total}>
              <span>Total</span>
              <span>{total.toFixed(2)} EGP</span>
            </div>

            <div className={styles.badges}>
              <div className={styles.badge}>
                <Shield size={16} />
                Secure Checkout
              </div>
              <div className={styles.badge}>
                <Truck size={16} />
                Free Returns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

