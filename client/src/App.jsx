import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import TryOn from "./pages/TryOn";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AdminSignIn from "./pages/AdminSignIn";
import AdminDashboard from "./pages/AdminDashboard";
import AddGlasses from "./pages/AddGlasses";
import UpdateProductImages from "./pages/UpdateProductImages";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/try-on" element={<TryOn />} />
                <Route path="/try-on/:id" element={<TryOn />} />
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
              </Routes>
            </Layout>
          }
        />

        {/* Admin routes without layout */}
        <Route path="/admin/signin" element={<AdminSignIn />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-glasses"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AddGlasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id/images"
          element={
            <ProtectedRoute requireAdmin={true}>
              <UpdateProductImages />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
