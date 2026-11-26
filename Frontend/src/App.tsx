
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";

// Home page components
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Marquee from "@/components/Marquee";
import Products from "@/components/Products";
import Features from "@/components/Features";
import Story from "@/components/Story";
import Testimonials from "@/components/Testimonials";
import B2B from "@/components/B2B";

// Customer pages
import SignIn from "@/data/SignIn";
import SignUp from "@/data/SignUp";
import Cart from "@/data/Cart";
import Shop from "@/data/Shop";
import MyOrders from "@/data/MyOrders";
import Checkout from "@/data/Checkout";

// Admin pages
import AdminDashboard from "@/admin/AdminDashboard";
import AddProduct from "@/admin/AddProduct";
import ProductManagement from "@/admin/ProductManagement";
import OrdersManagement from "@/admin/OrdersManagement";

// Customer AI Assistant
import AIChatAssistant from "./ai-assistant/components/AIChatAssistant";

// Home page
function Home() {
  return (
    <div className="min-h-screen bg-cream-50 overflow-x-hidden">
      <Navbar />

      <main>
        <Hero />
        <Stats />
        <Marquee />
        <Products />
        <Features />
        <Story />
        <Testimonials />
        <B2B />
      </main>

      <Footer />

      {/* Customer AI Assistant on Home page */}
      <AIChatAssistant />
    </div>
  );
}

// Layout for customer pages
function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-50 overflow-x-hidden">
      <Navbar />

      <main>{children}</main>

      <Footer />

      {/* Customer AI Assistant on customer pages */}
      <AIChatAssistant />
    </div>
  );
}

// Main App
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* CUSTOMER PAGES */}
        <Route
          path="/shop"
          element={
            <PublicLayout>
              <Shop />
            </PublicLayout>
          }
        />

        <Route
          path="/cart"
          element={
            <PublicLayout>
              <Cart />
            </PublicLayout>
          }
        />

        <Route
          path="/my-orders"
          element={
            <PublicLayout>
              <MyOrders />
            </PublicLayout>
          }
        />

        {/* CUSTOMER LOGIN REQUIRED */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/checkout"
            element={
              <PublicLayout>
                <Checkout />
              </PublicLayout>
            }
          />
        </Route>

        {/* AUTHENTICATION */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* ADMIN PAGES - ADMIN ONLY */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/products"
            element={<ProductManagement />}
          />

          <Route
            path="/admin/products/new"
            element={<AddProduct />}
          />

          <Route
            path="/admin/orders"
            element={<OrdersManagement />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
