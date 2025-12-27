// Product data
const dummyProducts = [
  {
    id: "kb-mech",
    name: "Mechanical Keyboard Pro",
    description: "Hot-swappable switches, per-key RGB, USB‑C, built for builders.",
    price: 129,
    tag: "Peripherals",
    badge: "New",
  },
  {
    id: "headset-wireless",
    name: "Lag‑Free Wireless Headset",
    description: "Low-latency audio with AI-powered noise isolation for crisp calls.",
    price: 89,
    tag: "Audio",
    badge: "Bestseller",
  },
  {
    id: "monitor-4k",
    name: "27\" 4K Creator Display",
    description: "Color-accurate IPS panel with 144Hz refresh for play and work.",
    price: 399,
    tag: "Monitors",
    badge: "Creator",
  },
  {
    id: "chair-ergonomic",
    name: "ErgoByte Chair",
    description: "Ergonomic chair with breathable mesh and 4D armrests.",
    price: 259,
    tag: "Workspace",
    badge: "Comfort",
  },
];

// Route definitions
const routes = {
  home: "home",
  products: "products",
  cart: "cart",
  login: "login",
  signup: "signup",
};

// Cart state
let cart = [];

// Cart functions
function getCart() {
  return cart;
}

function addToCart(productId) {
  const product = dummyProducts.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCartCount();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartCount();
}

function updateCartCount() {
  const countEl = document.getElementById("cart-count");
  if (countEl) {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    countEl.textContent = totalQty.toString();
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// Router functions
function navigateTo(route) {
  const routeKey = routes[route] ? route : routes.home;
  window.location.hash = `#${routeKey}`;
}

function setActiveRouteFromHash() {
  const hash = window.location.hash.replace("#", "") || routes.home;
  renderRoute(hash);
}

// View rendering functions
function renderRoute(route) {
  const viewRoot = document.getElementById("view-root");
  if (!viewRoot) return;

  switch (route) {
    case routes.products:
      viewRoot.innerHTML = renderProductsView();
      break;
    case routes.cart:
      viewRoot.innerHTML = renderCartView();
      break;
    case routes.login:
      viewRoot.innerHTML = renderLoginView();
      break;
    case routes.signup:
      viewRoot.innerHTML = renderSignupView();
      break;
    case routes.home:
    default:
      viewRoot.innerHTML = renderHomeView();
      break;
  }

  attachViewEventHandlers(route);
}

function renderHomeView() {
  return `
    <section class="view-section">
    </section>
  `;
}

function renderProductsView() {
  return `
    <section class="view-section">
      <header class="section-header">
        <div>
          <h2 class="section-title">
            <span class="section-title-icon">🧩</span>
            Demo products
          </h2>
          <p class="section-subtitle">
            These are dummy items to show how a products grid and cart flow could look.
          </p>
        </div>
        <button class="btn btn-ghost" data-route="cart">
          View cart
        </button>
      </header>
      <div class="products-grid">
        ${dummyProducts
          .map(
            (p) => `
          <article class="product-card">
            <div class="product-body">
              <div class="product-tag">
                <span>${p.tag}</span>
                <span>•</span>
                <span>${p.badge}</span>
              </div>
              <h3 class="product-name">${p.name}</h3>
              <p class="product-desc">${p.description}</p>
            </div>
            <div class="product-meta">
              <div>
                <div class="product-price">${p.price} EGP</div>
                <div class="product-pill">Demo only</div>
              </div>
              <button class="btn btn-primary btn-add-to-cart" data-product-id="${p.id}">
                Add to cart
              </button>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderCartView() {
  const cartItems = getCart();
  const total = getCartTotal();

  if (cartItems.length === 0) {
    return `
      <section class="view-section">
        <header class="section-header">
          <div>
            <h2 class="section-title">
              <span class="section-title-icon">🛒</span>
              Your cart
            </h2>
            <p class="section-subtitle">
              Add a few demo products to see how the cart page will feel.
            </p>
          </div>
          <button class="btn btn-ghost" data-route="products">
            Browse products
          </button>
        </header>
        <div class="cart-empty">
          <h3>Cart is empty (on purpose).</h3>
          <p>
            This prototype only keeps items in memory.
            Reloading the page will reset everything.
          </p>
          <button class="btn btn-primary" style="margin-top: 1rem;" data-route="products">
            Add demo items
          </button>
        </div>
      </section>
    `;
  }

  const list = cartItems
    .map(
      (item) => `
      <article class="cart-item">
        <div class="cart-item-main">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-meta">
            ${item.price} EGP • ${item.tag} • In demo cart
          </span>
        </div>
        <div class="cart-item-actions">
          <span class="qty-badge">x${item.qty}</span>
          <button class="btn-icon btn-remove" data-product-id="${item.id}" aria-label="Remove from cart">
            ✕
          </button>
        </div>
      </article>
    `
    )
    .join("");

  return `
    <section class="view-section">
      <header class="section-header">
        <div>
          <h2 class="section-title">
            <span class="section-title-icon">🛒</span>
            Your cart
          </h2>
          <p class="section-subtitle">
            Items live only in memory – this keeps the demo safe and easy to reset.
          </p>
        </div>
        <button class="btn btn-ghost" data-route="products">
          Add more items
        </button>
      </header>
      <div class="cart-list">
        ${list}
      </div>
      <div class="cart-summary">
        <div>
          <span>Demo total</span>
          <strong>${total.toFixed(2)} EGP</strong>
        </div>
        <button class="btn btn-primary" disabled title="Checkout is disabled in this demo">
          Checkout disabled
        </button>
      </div>
    </section>
  `;
}

function renderLoginView() {
  return `
    <section class="view-section">
      <div class="auth-layout-vertical">
        <div class="auth-copy">
          <h2>Welcome back to ByteCart</h2>
          <p>
            Sign in to your account to continue shopping. This is a demo UI only – 
            no passwords are stored; nothing is sent anywhere.
          </p>
        </div>
        <div class="auth-form">
          <form id="login-form" novalidate>
            <div class="field">
              <label for="login-email">Email</label>
              <input id="login-email" type="email" placeholder="you@example.com" required />
            </div>
            <div class="field">
              <label for="login-password">Password</label>
              <input id="login-password" type="password" placeholder="Enter your password" required />
              <p class="field-helper">
                We skip validation in this demo. Use any email & password to click through.
              </p>
            </div>
            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="signup.html" class="link-text">Forgot password?</a>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 0.4rem;">
              Sign in
            </button>
            <div class="form-footer">
              <span>Don't have an account? <a href="signup.html" class="link-text">Sign up</a></span>
              <span class="badge-demo">
                <span>⚠️</span>
                <span>Demo only, no real accounts.</span>
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;
}

function renderSignupView() {
  return `
    <section class="view-section">
      <div class="auth-layout-vertical">
        <div class="auth-copy">
          <h2>Create your ByteCart account</h2>
          <p>
            Join ByteCart to start shopping. This is a demo UI only – 
            no passwords are stored; nothing is sent anywhere.
          </p>
        </div>
        <div class="auth-form">
          <form id="signup-form" novalidate>
            <div class="field">
              <label for="signup-name">Full name</label>
              <input id="signup-name" type="text" placeholder="Ada Lovelace" required />
            </div>
            <div class="field">
              <label for="signup-email">Email</label>
              <input id="signup-email" type="email" placeholder="you@example.com" required />
            </div>
            <div class="field">
              <label for="signup-password">Password</label>
              <input id="signup-password" type="password" placeholder="Minimum 8 characters" required />
              <p class="field-helper">
                Passwords are not stored or sent anywhere in this prototype.
              </p>
            </div>
            <div class="field">
              <label for="signup-confirm">Confirm password</label>
              <input id="signup-confirm" type="password" placeholder="Re-enter your password" required />
            </div>
            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" required />
                <span>I agree to the <a href="#" class="link-text">Terms of Service</a> and <a href="#" class="link-text">Privacy Policy</a></span>
              </label>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 0.4rem;">
              Create account
            </button>
            <div class="form-footer">
              <span>Already have an account? <a href="login.html" class="link-text">Sign in</a></span>
              <span class="badge-demo">
                <span>⚠️</span>
                <span>Demo only, no real accounts.</span>
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;
}

function attachViewEventHandlers(route) {
  document
    .querySelectorAll("[data-route]")
    .forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const target = e.currentTarget;
        const targetRoute = target.getAttribute("data-route");
        if (targetRoute) {
          navigateTo(targetRoute);
        }
      })
    );

  if (route === routes.products) {
    document.querySelectorAll(".btn-add-to-cart").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget;
        const productId = target.getAttribute("data-product-id");
        if (productId) {
          addToCart(productId);
        }
      });
    });
  }

  if (route === routes.cart) {
    document.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget;
        const productId = target.getAttribute("data-product-id");
        if (productId) {
          removeFromCart(productId);
          renderRoute("cart");
        }
      });
    });
  }

  if (route === routes.login) {
    const form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Login UI demo only. No data was sent. This is just a prototype.");
      });
    }
  }

  if (route === routes.signup) {
    const form = document.getElementById("signup-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Signup UI demo only. No data was sent. This is just a prototype.");
      });
    }
  }
}

// Initialize navigation handlers
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("[data-route]")
    .forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const target = e.currentTarget;
        const route = target.getAttribute("data-route");
        if (route) {
          navigateTo(route);
        }
      })
    );

  setActiveRouteFromHash();
  updateCartCount();
});

// Handle hash changes for navigation
window.addEventListener("hashchange", setActiveRouteFromHash);

