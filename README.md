# FrameIt - AR Eyewear Virtual Try-On E-Commerce Platform

<div align="center">

![FrameIt Logo](client/src/assets/frameitlogo.png)

**A complete, professional e-commerce platform for eyewear with real-time AR virtual try-on functionality**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [AR Try-On Features](#-ar-try-on-features)
- [Admin Features](#-admin-features)
- [User Features](#-user-features)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

FrameIt is a full-stack e-commerce platform designed specifically for eyewear retailers. It combines traditional e-commerce functionality with cutting-edge AR (Augmented Reality) technology, allowing customers to virtually try on glasses in real-time using their webcam.

### Key Highlights

- **Real-Time AR Try-On**: Powered by Jeeliz FaceFilter and Three.js for accurate face tracking and 3D rendering
- **Complete E-Commerce**: Shopping cart, checkout, order management, and user authentication
- **Admin Dashboard**: Comprehensive product management with 3D model and texture support
- **Professional UI/UX**: Modern, futuristic design with smooth animations and responsive layout
- **Scalable Architecture**: RESTful API, MongoDB database, and modular React frontend

---

## ✨ Features

### 🛍️ E-Commerce Features

- **Product Catalog**
  - Browse products with high-quality images
  - Advanced filtering (gender, category, frame color, lens color, material, price range)
  - Product search and categorization
  - Detailed product pages with specifications

- **Shopping Experience**
  - Add to cart functionality
  - Shopping cart with quantity management
  - Secure checkout process (3-step: Contact → Shipping → Payment)
  - Order history and tracking
  - Product recommendations

- **User Management**
  - User registration and authentication
  - Profile management
  - Order history
  - Secure password hashing with bcryptjs

### 🎭 AR Virtual Try-On

- **Real-Time Face Detection**
  - Accurate face tracking using Jeeliz FaceFilter
  - Automatic face detection and positioning
  - Works with standard webcams

- **3D Model Rendering**
  - Support for GLTF/GLB and JSON BufferGeometry formats
  - Automatic scaling and positioning
  - Multiple model selection
  - Real-time rendering with Three.js

- **Product Selection**
  - Browse products while trying on
  - Select any product to try on instantly
  - Product images displayed in sidebar
  - Add to cart directly from try-on page

- **Camera Controls**
  - Start/stop camera
  - Face detection status indicator
  - Responsive canvas sizing
  - Error handling and recovery

### 👨‍💼 Admin Features

- **Product Management**
  - Add new products with complete details
  - Upload 3D models (GLTF/GLB/JSON)
  - Upload product images
  - Update existing products
  - Delete products
  - View all products with details

- **Order Management**
  - View all orders
  - Update order status (pending, processing, shipped, delivered, cancelled)
  - View order details (customer, items, totals)
  - Order statistics (total revenue, pending orders)

- **3D Model Management**
  - Upload frame and lens models
  - Automatic GLTF processing and scaling
  - Texture upload support
  - Model metadata storage

- **Image Management**
  - Upload multiple product images
  - Update product images
  - Image gallery management

### 🎨 UI/UX Features

- **Modern Design**
  - Futuristic and elegant theme
  - Gold and black color scheme
  - Smooth animations with Framer Motion
  - Responsive design (mobile, tablet, desktop)

- **User Experience**
  - Intuitive navigation
  - Loading states and error handling
  - Empty states with helpful messages
  - Toast notifications (ready for implementation)

---

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing
- **Zustand** - State management
- **Framer Motion** - Animations
- **Three.js** - 3D rendering
- **Jeeliz FaceFilter** - AR face tracking
- **Lucide React** - Icon library
- **CSS Modules** - Scoped styling

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM (Object Document Mapper)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Three.js** - 3D model processing
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - Cookie handling

### Development Tools

- **ESLint** - Code linting
- **Concurrently** - Run multiple processes
- **dotenv** - Environment variables

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd FrameIt-AR-EyeWearTryOn-main
```

### 2. Install Dependencies

**Install all dependencies (root, backend, and frontend):**

```bash
npm run install:all
```

**Or install separately:**

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../client
npm install
```

### 3. Environment Configuration

**Backend Environment Variables**

Create `backend/.env`:

```env
# Database
MONGO_URI=mongodb://localhost:27017/frameit
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/frameit

# Server
PORT=5001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173

# API URL (optional)
API_URL=http://localhost:5001/api
```

**Frontend Environment Variables**

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

### 4. Create Admin User

```bash
cd backend
npm run create-admin
```

Follow the prompts to create your admin account.

**Or use the API directly:**

```bash
curl -X POST http://localhost:5001/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password",
    "name": "Admin User"
  }'
```

---

## ⚙️ Configuration

### MongoDB Setup

**Local MongoDB:**
1. Install MongoDB locally
2. Start MongoDB service: `mongod`
3. Use connection string: `mongodb://localhost:27017/frameit`

**MongoDB Atlas (Cloud):**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in `backend/.env`

### Port Configuration

- **Backend:** Default port `5001` (configurable in `.env`)
- **Frontend:** Default port `5173` (Vite default)

### File Upload Configuration

- **Max file size:** 50MB (configurable in `backend/src/middleware/upload.js`)
- **Allowed formats:**
  - Models: `.gltf`, `.glb`, `.json`, `.bin`
  - Images: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`
  - Textures: `.jpg`, `.jpeg`, `.png`

---

## 🏃 Running the Application

### Development Mode

**Option 1: Run with Concurrently (Recommended)**

From the root directory:

```bash
npm run dev
```

This starts both backend and frontend servers simultaneously.

**Option 2: Run Separately**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Production Mode

**Build frontend:**
```bash
cd client
npm run build
```

**Start backend:**
```bash
cd backend
npm start
```

**Serve frontend (using a static server):**
```bash
cd client
npm run preview
```

---

## 📍 Access Points

Once the application is running:

- **Frontend Application:** http://localhost:5173
- **Backend API:** http://localhost:5001/api
- **API Health Check:** http://localhost:5001/api/health
- **Admin Sign In:** http://localhost:5173/admin/signin
- **Admin Dashboard:** http://localhost:5173/admin/dashboard
- **Add Products:** http://localhost:5173/admin/add-glasses
- **Virtual Try-On:** http://localhost:5173/try-on
- **Shop:** http://localhost:5173/shop
- **Cart:** http://localhost:5173/cart

---

## 📁 Project Structure

```
FrameIt-AR-EyeWearTryOn-main/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── jwt.js              # JWT configuration
│   │   ├── controllers/
│   │   │   ├── adminController.js  # Admin operations
│   │   │   ├── authController.js   # Authentication
│   │   │   └── orderController.js  # Order management
│   │   ├── middleware/
│   │   │   ├── auth.js             # Authentication middleware
│   │   │   └── upload.js           # File upload configuration
│   │   ├── models/
│   │   │   ├── Admin.js             # Admin schema
│   │   │   ├── GlassesModel.js      # 3D model schema
│   │   │   ├── Order.js             # Order schema
│   │   │   ├── Product.js           # Product schema
│   │   │   └── User.js              # User schema
│   │   ├── routes/
│   │   │   ├── adminRoutes.js       # Admin API routes
│   │   │   ├── authRoutes.js        # Auth API routes
│   │   │   └── orderRoutes.js       # Order API routes
│   │   ├── utils/
│   │   │   ├── addProductImage.js   # Add image utility
│   │   │   ├── createAdmin.js       # Create admin script
│   │   │   ├── processGLTFModel.js  # GLTF processing
│   │   │   ├── seedRayban.js        # Seed Rayban product
│   │   │   └── verifyAdmin.js       # Verify admin script
│   │   ├── public/
│   │   │   ├── dist/                # Jeeliz FaceFilter
│   │   │   ├── helpers/             # Jeeliz helpers
│   │   │   ├── images/              # Product images
│   │   │   ├── libs/                 # Three.js libraries
│   │   │   ├── models/              # 3D models
│   │   │   └── neuralNets/          # AI models
│   │   └── server.js                # Express server
│   └── package.json
├── client/
│   ├── src/
│   │   ├── assets/
│   │   │   └── frameitlogo.png      # Logo
│   │   ├── components/
│   │   │   ├── Button.jsx            # Reusable button
│   │   │   ├── Footer.jsx            # Footer component
│   │   │   ├── Header.jsx            # Header component
│   │   │   ├── Layout.jsx            # Layout wrapper
│   │   │   ├── ProductCard.jsx       # Product card
│   │   │   └── ProtectedRoute.jsx    # Route protection
│   │   ├── config/
│   │   │   └── api.js                # API configuration
│   │   ├── pages/
│   │   │   ├── AddGlasses.jsx        # Add product page
│   │   │   ├── AdminDashboard.jsx    # Admin dashboard
│   │   │   ├── AdminSignIn.jsx        # Admin login
│   │   │   ├── Cart.jsx              # Shopping cart
│   │   │   ├── Checkout.jsx          # Checkout process
│   │   │   ├── Home.jsx              # Home page
│   │   │   ├── Orders.jsx            # User orders
│   │   │   ├── ProductDetail.jsx     # Product details
│   │   │   ├── Shop.jsx              # Shop page
│   │   │   ├── SignIn.jsx            # User sign in
│   │   │   ├── SignUp.jsx            # User sign up
│   │   │   ├── TryOn.jsx             # AR try-on page
│   │   │   └── UpdateProductImages.jsx # Update images
│   │   ├── store/
│   │   │   ├── authStore.js          # Auth state
│   │   │   └── useStore.js           # Cart/wishlist state
│   │   ├── App.jsx                   # Main app component
│   │   ├── index.css                 # Global styles
│   │   └── main.jsx                  # Entry point
│   ├── public/
│   └── package.json
└── package.json
```

---

## 📖 Usage Guide

### For Administrators

#### 1. Sign In

Navigate to http://localhost:5173/admin/signin and sign in with your admin credentials.

#### 2. Add a New Product

1. Go to **Admin Dashboard** → **Add New Glasses**
2. Fill in product information:
   - **Name**: Product name (e.g., "Rayban Aviator Classic")
   - **Brand**: Brand name (e.g., "Rayban")
   - **Price**: Product price
   - **Category**: Sunglasses, Optical, etc.
   - **Gender**: Men, Women, Unisex, Kids
   - **Frame Color**: Black, Brown, Gold, etc.
   - **Lens Color**: Clear, Tinted, etc.
   - **Material**: Plastic, Metal, etc.

3. **Upload 3D Models:**
   - **Frame Model**: `frame.json` or `frame.gltf` (required)
   - **Lens Model**: `lenses.json` or `lenses.gltf` (required)
   - **Occluder**: `occluder.json` (optional, for face occlusion)

4. **Upload Textures (Optional):**
   - Frame textures: `frame-texture.jpg`, `frame-normal.jpg`, etc.
   - Lens textures: `lens-texture.jpg`, `lens-normal.jpg`

5. **Upload Product Images:**
   - Upload multiple product images for the gallery

6. Click **Add Glasses** to save

#### 3. Manage Products

- View all products in **Admin Dashboard**
- Update product images
- Delete products
- View product details

#### 4. Manage Orders

- View all orders in **Orders** tab
- Update order status
- View order details and customer information

### For Users

#### 1. Browse Products

- Visit the **Shop** page
- Use filters to find products
- View product details

#### 2. Try On Glasses

1. Go to **Try On** page
2. Click **Start Camera**
3. Allow camera permissions
4. Select a product from the sidebar
5. See the glasses rendered on your face in real-time
6. Add to cart directly from try-on page

#### 3. Shopping

- Add products to cart
- View cart and adjust quantities
- Proceed to checkout
- Complete order with shipping and payment info

#### 4. View Orders

- Go to **Orders** page (requires sign in)
- View order history
- Track order status

---

## 🔌 API Documentation

### Authentication Endpoints

#### Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "admin": {
      "id": "...",
      "email": "admin@example.com",
      "name": "Admin User"
    }
  }
}
```

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "password"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Rayban Aviator Classic",
      "brand": "Rayban",
      "price": 199.99,
      "images": ["images/products/..."],
      "category": "Sunglasses",
      "gender": "Unisex",
      ...
    }
  ]
}
```

#### Get Product by Slug
```http
GET /api/products/:slug
```

### Admin Endpoints

#### Add Complete Glasses Package
```http
POST /api/admin/glasses/add-complete
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

Form Data:
- name: "Product Name"
- brand: "Brand Name"
- price: 199.99
- modelFiles[]: <file>
- productImages[]: <file>
- textureFiles[]: <file>
- ... (other product fields)
```

#### Get All Products (Admin)
```http
GET /api/admin/products
Authorization: Bearer <admin-token>
```

#### Update Product Images
```http
PATCH /api/admin/products/:id/images
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

Form Data:
- productImages[]: <file>
```

#### Delete Product
```http
DELETE /api/admin/products/:id
Authorization: Bearer <admin-token>
```

### Order Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product-id",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  },
  "paymentMethod": "credit_card"
}
```

#### Get User Orders
```http
GET /api/orders/my
Authorization: Bearer <user-token>
```

#### Get All Orders (Admin)
```http
GET /api/orders/admin
Authorization: Bearer <admin-token>
```

#### Update Order Status
```http
PATCH /api/orders/admin/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "shipped"
}
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique, lowercase),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Model
```javascript
{
  email: String (unique, lowercase),
  password: String (hashed),
  name: String,
  role: String (default: "admin"),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String (required),
  slug: String (unique, auto-generated),
  brand: String,
  price: Number (required),
  originalPrice: Number,
  description: String,
  category: String,
  gender: String,
  frameColor: String,
  lensColor: String,
  material: String,
  frameShape: String,
  images: [String], // Array of image paths
  glassesModelId: ObjectId (ref: GlassesModel),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### GlassesModel Model
```javascript
{
  name: String (required, unique),
  modelFiles: {
    frame: String, // Path to frame model
    lenses: String, // Path to lens model
    occluder: String, // Path to occluder
    frameGLTF: String, // Path to GLTF frame
    lensesGLTF: String, // Path to GLTF lenses
    envMap: String // Environment map
  },
  textures: {
    frameTexture: String,
    frameNormal: String,
    frameRoughness: String,
    frameMetalness: String,
    lensTexture: String,
    lensNormal: String
  },
  modelMetadata: {
    scale: Number, // Calculated scale for try-on
    position: { x, y, z },
    rotation: { x, y, z }
  },
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  orderNumber: String (unique, auto-generated),
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  status: String (enum: pending, processing, shipped, delivered, cancelled),
  paymentStatus: String (enum: pending, paid, failed, refunded),
  paymentMethod: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎭 AR Try-On Features

### How It Works

1. **Face Detection**: Uses Jeeliz FaceFilter neural network to detect and track the user's face
2. **3D Rendering**: Three.js renders the 3D glasses model on the detected face
3. **Real-Time Updates**: Continuously updates the glasses position as the user moves

### Supported Model Formats

- **GLTF/GLB**: Industry-standard 3D format
- **JSON BufferGeometry**: Three.js native format
- **Textures**: JPG, PNG formats

### Model Requirements

- **Frame Model**: Required, should be properly scaled
- **Lens Model**: Required for complete glasses
- **Occluder**: Optional, for better face occlusion
- **Environment Map**: For realistic reflections

### Automatic Processing

When you upload a GLTF model:
- Backend automatically calculates optimal scale
- Extracts metadata (position, rotation)
- Modifies texture paths for correct loading
- Stores metadata in database

---

## 👨‍💼 Admin Features

### Dashboard Overview

- **Statistics**: Total products, orders, revenue, pending orders
- **Product Management**: View, add, edit, delete products
- **Order Management**: View and update order statuses

### Product Management

#### Adding Products

1. **Basic Information**
   - Product name, brand, price
   - Category, gender, material
   - Frame and lens colors

2. **3D Models**
   - Upload frame model (GLTF/JSON)
   - Upload lens model (GLTF/JSON)
   - Optional occluder model

3. **Textures**
   - Frame textures (diffuse, normal, roughness, metalness)
   - Lens textures (diffuse, normal)
   - Automatic detection based on filename

4. **Product Images**
   - Multiple images for product gallery
   - High-quality product photos

#### Managing Products

- **View All**: See all products with details
- **Update Images**: Add more product images
- **Delete**: Remove products from catalog
- **View Details**: See complete product information

### Order Management

- **View All Orders**: List of all customer orders
- **Order Details**: Customer info, items, totals
- **Update Status**: Change order status (pending → processing → shipped → delivered)
- **Statistics**: Total revenue and pending orders

---

## 👤 User Features

### Shopping Experience

- **Browse Products**: Shop page with filters
- **Product Details**: Detailed product pages
- **Shopping Cart**: Add, remove, update quantities
- **Checkout**: Secure 3-step checkout process
- **Order History**: View past orders

### AR Try-On

- **Real-Time Try-On**: See glasses on your face
- **Product Selection**: Choose from available products
- **Add to Cart**: Purchase directly from try-on
- **Camera Controls**: Start/stop camera

### Account Management

- **Registration**: Create account
- **Sign In**: Secure authentication
- **Order Tracking**: View order status
- **Profile**: Manage account information

---

## 🚀 Deployment

> **📖 For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Overview

**Recommended Setup:**
- **Frontend**: Vercel (free tier available)
- **Backend**: Railway or Render (better for Node.js/Express)
- **Database**: MongoDB Atlas (free tier available)

### Quick Deploy Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy Frontend to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Set root directory to `client`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`

3. **Deploy Backend to Railway/Render**
   - Connect GitHub repository
   - Set root directory to `backend`
   - Add environment variables (see DEPLOYMENT.md)
   - Deploy

4. **Configure MongoDB Atlas**
   - Create cluster
   - Get connection string
   - Add to backend environment variables

5. **Create Admin User**
   - Use backend console or API
   - See DEPLOYMENT.md for details

### Environment Variables

**Frontend (Vercel):**
```
VITE_API_URL=https://your-backend-url.com/api
```

**Backend (Railway/Render):**
```
MONGO_URI=mongodb+srv://...
PORT=5001
NODE_ENV=production
JWT_SECRET=your-secret
FRONTEND_URL=https://your-frontend.vercel.app
```

### Detailed Guide

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for:
- Step-by-step Vercel deployment
- Backend deployment options
- Environment variable setup
- Post-deployment checklist
- Troubleshooting guide
- Cost estimation

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 5001 (backend)
lsof -ti:5001 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

#### MongoDB Connection Error

- Check `MONGO_URI` in `backend/.env`
- Ensure MongoDB is running (local) or accessible (Atlas)
- Verify network access and firewall settings

#### Module Not Found

```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../client && rm -rf node_modules && npm install
```

#### CORS Errors

- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check CORS configuration in `backend/src/server.js`

#### Camera Not Working

- Grant camera permissions in browser
- Check if camera is being used by another app
- Try different browser
- Check browser console for errors

#### GLTF Loading Issues

- Verify GLTF file is valid
- Check texture paths in GLTF file
- Ensure all referenced files are uploaded
- Check browser console for specific errors

---

## 📝 Development Scripts

### Root Directory

```bash
npm run dev              # Run both backend and frontend
npm run install:all      # Install all dependencies
```

### Backend

```bash
npm start                # Production mode
npm run dev              # Development mode with auto-reload
npm run create-admin     # Create admin user
npm run verify-admin     # Verify admin credentials
npm run seed-rayban      # Seed Rayban test product
npm run add-product-image # Add image to product
```

### Frontend

```bash
npm run dev              # Development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

---

## 🎓 Technologies Used

### Frontend
- **React 19** - UI library
- **Vite 7** - Build tool
- **React Router 7** - Routing
- **Zustand 5** - State management
- **Framer Motion 12** - Animations
- **Three.js 0.182** - 3D graphics
- **Jeeliz FaceFilter** - AR face tracking
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js 4** - Web framework
- **MongoDB** - Database
- **Mongoose 8** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Three.js** - 3D processing

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 🤝 Support

For issues, questions, or contributions, please contact the development team.

---

## 🎉 Acknowledgments

- **Jeeliz** - FaceFilter library for AR face tracking
- **Three.js** - 3D graphics library
- **React Team** - React framework
- **MongoDB** - Database solution

---

<div align="center">

**Built with ❤️ for the future of e-commerce**

[Back to Top](#frameit---ar-eyewear-virtual-try-on-e-commerce-platform)

</div>
