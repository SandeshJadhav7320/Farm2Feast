
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Marquee from "@/components/Marquee";
import Products from "@/components/Products";
import Features from "@/components/Features";
import Story from "@/components/Story";
import Testimonials from "@/components/Testimonials";
import B2B from "@/components/B2B";

import SignIn from "@/data/SignIn";
import SignUp from "@/data/SignUp";
import Cart from "@/data/Cart";
import Shop from "@/data/Shop";
import MyOrders from "@/data/MyOrders";
import Checkout from "@/data/Checkout";


import AdminDashboard from "@/admin/AdminDashboard";
import AddProduct from "@/admin/AddProduct";
import ProductManagement from "@/admin/ProductManagement";
import OrdersManagement from "@/admin/OrdersManagement";
import ProtectedRoute from "@/components/ProtectedRoute";

/* =========================
   HOME
========================= */

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
    </div>
  );
}

/* =========================
   PUBLIC LAYOUT
========================= */

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
    </div>
  );
}

/* =========================
   APP
========================= */

export default function App() {
  return (
    <BrowserRouter>
      {/* Scroll to the top whenever the route changes */}
      <ScrollToTop />

      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* SHOP */}
        <Route
          path="/shop"
          element={
            <PublicLayout>
              <Shop />
            </PublicLayout>
          }
        />

        {/* CART */}
        <Route
          path="/cart"
          element={
            <PublicLayout>
              <Cart />
            </PublicLayout>
          }
        />

        {/* MY ORDERS */}
        <Route
          path="/my-orders"
          element={
            <PublicLayout>
              <MyOrders />
            </PublicLayout>
          }
        />

        {/* CHECKOUT - LOGIN REQUIRED */}
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

        {/* SIGN IN */}
        <Route path="/signin" element={<SignIn />} />

        {/* SIGN UP */}
        <Route path="/signup" element={<SignUp />} />

        {/* ADMIN DASHBOARD */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/products/new"
            element={<AddProduct />}
          />
        </Route>

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
        </Route>

        <Route
          path="/admin/orders"
          element={<OrdersManagement />}
        />
      </Routes>
    </BrowserRouter>
  );
}