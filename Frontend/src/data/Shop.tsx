
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Star,
  Plus,
  Minus,
  X,
  SlidersHorizontal,
  ChevronDown,
  Truck,
  ShieldCheck,
  Leaf,
  Sparkles,
  Package,
  ArrowRight,
  Heart,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

type Category = string;

interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  weight: string;
  image: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface CheckoutItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

const API_URL = "http://localhost:8080";

const Shop: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products from the existing backend API.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("token");

        if (!token) {
          setError("Please sign in to view products.");
          return;
        }

        const response = await fetch(`${API_URL}/api/user/products`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          setError("Your session has expired. Please sign in again.");
          return;
        }

        if (response.status === 403) {
          setError("You do not have permission to view these products.");
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Failed to fetch products (${response.status}).`
          );
        }

        const data = await response.json();

        const productList: ApiProduct[] = Array.isArray(data)
          ? data
          : data.content ?? [];

        const formattedProducts: Product[] = productList.map(
          (product) => ({
            id: product.id,
            name: product.name,
            category: product.category || "Other",
            description: product.description || "",
            price: Number(product.price),
            image: product.imageUrl || "",
            stock: Number(product.quantity),
            rating: 4.8,
            reviews: 0,
            weight: "100g",
          })
        );

        setProducts(formattedProducts);
      } catch (err) {
        console.error("Product fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, []);

  // Categories.
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category))
    );

    return ["All", ...uniqueCategories];
  }, [products]);

  // Search, category filtering and sorting.
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    switch (sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, search, sort]);

  // Open add-to-cart quantity modal.
  const openCartChecklist = (product: Product) => {
    if (product.stock <= 0) return;

    setSelectedProduct(product);
    setSelectedQuantity(1);
    setCartError("");
    setAddedMessage("");
  };

  const increaseSelectedQuantity = () => {
    if (!selectedProduct) return;

    setSelectedQuantity((quantity) =>
      Math.min(quantity + 1, selectedProduct.stock)
    );
  };

  const decreaseSelectedQuantity = () => {
    setSelectedQuantity((quantity) => Math.max(1, quantity - 1));
  };

  // Add item to the backend cart API.
  const confirmAddToCart = async () => {
    if (!selectedProduct) return;

    const product = selectedProduct;
    const token = sessionStorage.getItem("token");

    if (!token) {
      setCartError("Please sign in to add products to your cart.");
      return;
    }

    try {
      setAddingToCart(true);
      setCartError("");

      const response = await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: selectedQuantity,
        }),
      });

      const responseText = await response.text();

      if (response.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setCartError("Your session has expired. Please sign in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(responseText || "Unable to add product to cart.");
      }

      setCart((currentCart) => {
        const existing = currentCart.find(
          (item) => item.id === product.id
        );

        if (existing) {
          return currentCart.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + selectedQuantity,
                    item.stock
                  ),
                }
              : item
          );
        }

        return [
          ...currentCart,
          { ...product, quantity: selectedQuantity },
        ];
      });

      setSelectedProduct(null);
      setSelectedQuantity(1);
      setAddedMessage(`${product.name} added to your cart!`);

      window.setTimeout(() => setAddedMessage(""), 3000);
    } catch (err) {
      console.error("Add to cart error:", err);
      setCartError(
        err instanceof Error
          ? err.message
          : "Unable to add product to cart."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy Now: save one item and open checkout.
  const buyNow = (product: Product) => {
    if (product.stock <= 0) return;

    const checkoutItems: CheckoutItem[] = [
      {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
        imageUrl: product.image,
      },
    ];

    sessionStorage.setItem(
      "checkoutItems",
      JSON.stringify(checkoutItems)
    );

    navigate("/checkout");
  };

  // Local cart quantity controls.
  const increaseQuantity = (id: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Checkout all items currently in the local cart.
  const checkoutCart = () => {
    if (cart.length === 0) return;

    const checkoutItems: CheckoutItem[] = cart.map((item) => ({
      productId: item.id,
      productName: item.name,
      unitPrice: item.price,
      quantity: item.quantity,
      imageUrl: item.image,
    }));

    sessionStorage.setItem(
      "checkoutItems",
      JSON.stringify(checkoutItems)
    );

    setCartOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="shop-page min-h-screen overflow-hidden bg-[#faf9f5] text-[#24301f]">
      <style>{`
        @keyframes shopFadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shopFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shopFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(4deg); }
        }

        @keyframes shopPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        @keyframes shopPop {
          0% { opacity: 0; transform: scale(.92); }
          100% { opacity: 1; transform: scale(1); }
        }

        .shop-reveal {
          animation: shopFadeUp .65s ease-out both;
        }

        .shop-product-card {
          animation: shopFadeUp .55s ease-out both;
        }

        .shop-float {
          animation: shopFloat 5s ease-in-out infinite;
        }

        .shop-modal {
          animation: shopPop .25s ease-out both;
        }

        .shop-page button:focus-visible,
        .shop-page a:focus-visible,
        .shop-page input:focus-visible,
        .shop-page select:focus-visible {
          outline: 3px solid rgba(123, 150, 92, .5);
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .shop-page *,
          .shop-page *::before,
          .shop-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      {/* Shop hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#edf2e6] via-[#f7f7ed] to-[#f5ead6]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#c9d8b5]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-[-70px] h-72 w-72 rounded-full bg-[#e8d5a7]/35 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
          <div className="shop-reveal relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8e1cc] bg-white/75 px-4 py-2 text-sm font-semibold text-[#61794a] shadow-sm backdrop-blur">
              <Leaf size={16} />
              Naturally delicious. Thoughtfully made.
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-[#24301f] sm:text-5xl lg:text-6xl">
              A little crunch.
              <span className="mt-2 block text-[#7b965c]">
                A lot of goodness.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-[#697363] sm:text-lg">
              Discover your favourite makhana snacks, carefully selected
              for your everyday cravings. Good snacks, happy moments.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("products")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#7b965c] px-7 py-4 font-bold text-white shadow-lg shadow-[#7b965c]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#657d4d] hover:shadow-xl"
              >
                Explore collection
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dfe5d6] bg-white/70 px-6 py-4 text-sm font-semibold text-[#526247] backdrop-blur">
                <ShieldCheck size={18} />
                Easy and secure checkout
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-[#697363]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#7b965c]" />
                Everyday snacking
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#7b965c]" />
                Convenient delivery
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg shop-reveal lg:pl-4">
            <div className="absolute inset-6 rounded-[3rem] bg-[#dce6cf] blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 p-3 shadow-2xl shadow-[#526247]/10 backdrop-blur-sm sm:rounded-[2.5rem] sm:p-5">
              <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#dce7cc] via-[#f5f1df] to-[#e9d6ac] p-6 sm:min-h-[380px] sm:p-8">
                <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/40" />
                <div className="absolute -right-2 top-0 h-32 w-32 rounded-full border border-white/40" />
                <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-white/25 blur-xl" />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="rounded-full bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-[#657d4d] shadow-sm">
                    Farm2Feast
                  </div>
                  <div className="shop-float rounded-2xl bg-white/75 p-3 text-[#7b965c] shadow-sm">
                    <Sparkles size={24} />
                  </div>
                </div>

                <div className="relative z-10 py-8 text-center">
                  <div className="shop-float mx-auto mb-5 flex h-36 w-36 items-center justify-center rounded-full border border-white/70 bg-white/55 shadow-xl backdrop-blur sm:h-48 sm:w-48">
                    <div className="flex h-[82%] w-[82%] items-center justify-center rounded-full bg-gradient-to-br from-[#fff8e7] to-[#e8d7a8] shadow-inner">
                      <span className="text-7xl drop-shadow-sm sm:text-8xl">
                        🌾
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-extrabold text-[#35452b] sm:text-3xl">
                    Snack happy.
                  </h2>
                  <p className="mt-2 text-sm text-[#69785c] sm:text-base">
                    Find your next favourite crunch.
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                    <p className="text-xs font-medium text-[#7b8178]">
                      Your next snack
                    </p>
                    <p className="mt-1 font-bold text-[#35452b]">
                      Awaits you
                    </p>
                  </div>
                  <div className="shop-float rounded-2xl bg-[#7b965c] p-4 text-white shadow-lg">
                    <ShoppingBag size={25} />
                  </div>
                </div>
              </div>
            </div>

            <div className="shop-float absolute -left-2 top-12 hidden items-center gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-xl backdrop-blur sm:flex lg:-left-8">
              <div className="rounded-xl bg-[#edf3e7] p-2 text-[#7b965c]">
                <Leaf size={21} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#35452b]">
                  Feel-good snacking
                </p>
                <p className="text-xs text-[#7b8178]">
                  Made for everyday moments
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section
        id="products"
        className="mx-auto max-w-7xl scroll-mt-8 px-6 py-14 sm:py-20 lg:px-8"
      >
        <div className="shop-reveal mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[.18em] text-[#7b965c]">
              <Sparkles size={16} />
              Our collection
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-[#24301f] sm:text-4xl lg:text-5xl">
              Shop your favourite
              <span className="block text-[#7b965c]">
                crunch.
              </span>
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-[#7b8178]">
              Discover delicious picks for your pantry, your breaks, and
              every little craving in between.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-[#e4e8de] bg-white px-4 py-3 shadow-sm">
            <div className="rounded-xl bg-[#edf3e7] p-2 text-[#7b965c]">
              <Package size={20} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#24301f]">
                {loading ? "—" : filteredProducts.length}
              </p>
              <p className="text-xs text-[#7b8178]">
                {filteredProducts.length === 1 ? "Product" : "Products"}
              </p>
            </div>
          </div>
        </div>

        {/* Search and sorting */}
        <div className="shop-reveal mb-6 rounded-3xl border border-[#e6e8e1] bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="group relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#92998b] transition-colors group-focus-within:text-[#7b965c]"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, flavours, categories..."
                aria-label="Search products"
                className="w-full rounded-2xl border border-transparent bg-[#f7f8f4] py-4 pl-12 pr-11 text-sm text-[#24301f] outline-none transition duration-300 placeholder:text-[#9a9f94] focus:border-[#b8c9a6] focus:bg-white focus:ring-4 focus:ring-[#7b965c]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#7b8178] transition hover:bg-[#e9eee3] hover:text-[#35452b]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="relative lg:w-64">
              <SlidersHorizontal
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7b965c]"
              />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort products"
                className="w-full appearance-none rounded-2xl border border-[#e6e8e1] bg-white py-4 pl-11 pr-12 text-sm font-semibold text-[#35452b] outline-none transition hover:border-[#b8c9a6] focus:border-[#7b965c] focus:ring-4 focus:ring-[#7b965c]/10"
              >
                <option value="featured">Featured products</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7b8178]"
              />
            </div>
          </div>
        </div>

        {/* Category pills */}
        {!loading && !error && products.length > 0 && (
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#8a9182]">
              <SlidersHorizontal size={14} />
              Browse by category
            </div>

            <div className="flex gap-2 overflow-x-auto pb-3">
              {categories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                      active
                        ? "scale-[1.02] border-[#7b965c] bg-[#7b965c] text-white shadow-lg shadow-[#7b965c]/20"
                        : "border-[#e4e8de] bg-white text-[#65705e] hover:-translate-y-0.5 hover:border-[#b8c9a6] hover:bg-[#edf2e9]"
                    }`}
                  >
                    {category === "All" ? "All products" : category}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Success message */}
        {addedMessage && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800"
            style={{ animation: "shopFadeUp .3s ease-out both" }}
          >
            <CheckCircle2 size={21} />
            <span className="flex-1">{addedMessage}</span>
            <button
              type="button"
              onClick={() => setAddedMessage("")}
              aria-label="Dismiss message"
              className="rounded-full p-1 hover:bg-green-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-[#e6e8e3] bg-white p-3"
              >
                <div className="aspect-square animate-pulse rounded-2xl bg-[#edf0e9]" />
                <div className="space-y-3 p-3 pt-5">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-[#edf0e9]" />
                  <div className="h-5 w-3/4 animate-pulse rounded-full bg-[#edf0e9]" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-[#edf0e9]" />
                  <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#edf0e9]" />
                  <div className="h-11 animate-pulse rounded-xl bg-[#edf0e9]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Package size={30} />
            </div>

            <h3 className="mt-5 text-xl font-extrabold text-[#24301f]">
              Unable to load products
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#7b8178]">
              {error}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-full border border-[#e4e8de] px-6 py-3 font-semibold text-[#35452b] transition hover:bg-[#f4f6f0]"
              >
                <RefreshCw size={17} />
                Try again
              </button>

              {!sessionStorage.getItem("token") && (
                <button
                  type="button"
                  onClick={() => navigate("/signin")}
                  className="rounded-full bg-[#7b965c] px-6 py-3 font-semibold text-white transition hover:bg-[#657d4d]"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-[#7b8178]">
                Showing{" "}
                <span className="font-bold text-[#35452b]">
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </p>

              {(search || selectedCategory !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                  className="text-sm font-semibold text-[#6e8951] underline decoration-[#b8c9a6] underline-offset-4 transition hover:text-[#35452b]"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onAdd={() => openCartChecklist(product)}
                  onBuyNow={() => buyNow(product)}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty search results */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-3xl border border-[#e6e8e1] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf3e7] text-[#7b965c]">
              <Search size={29} />
            </div>

            <h3 className="mt-5 text-2xl font-extrabold text-[#24301f]">
              No products found
            </h3>

            <p className="mt-2 text-sm text-[#7b8178]">
              Try another search term or explore a different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="mt-6 rounded-full bg-[#7b965c] px-6 py-3 font-semibold text-white transition hover:bg-[#657d4d]"
            >
              Show all products
            </button>
          </div>
        )}
      </section>

      {/* Benefits section */}
      <section className="relative overflow-hidden border-y border-[#e5e8e1] bg-white">
        <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[#edf3e7] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center shop-reveal">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#7b965c]">
              The Farm2Feast difference
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#24301f] sm:text-4xl">
              Good snacks. Good moments.
            </h2>
            <p className="mt-3 leading-7 text-[#7b8178]">
              A thoughtful shopping experience from browsing to delivery.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Leaf size={24} />}
              title="Mindful Snacking"
              text="Explore snack options for your everyday cravings."
              index={0}
            />
            <Feature
              icon={<Sparkles size={24} />}
              title="Made for Enjoyment"
              text="Find new favourites for work breaks and relaxing moments."
              index={1}
            />
            <Feature
              icon={<Package size={24} />}
              title="Careful Packaging"
              text="Your order is prepared for a convenient delivery experience."
              index={2}
            />
            <Feature
              icon={<Truck size={24} />}
              title="Delivery Updates"
              text="View your order status and available tracking details."
              index={3}
            />
          </div>
        </div>
      </section>

      {/* Add-to-cart quantity modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#172016]/55 px-4 py-6 backdrop-blur-md"
          onClick={() => {
            if (!addingToCart) setSelectedProduct(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-cart-title"
            onClick={(event) => event.stopPropagation()}
            className="shop-modal my-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-2xl"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-[#edf3e7] to-[#f8f3e5] px-6 pb-5 pt-6">
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/50 blur-2xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#7b965c]">
                    <ShoppingBag size={14} />
                    Your selection
                  </div>
                  <h2
                    id="add-cart-title"
                    className="text-2xl font-extrabold text-[#24301f]"
                  >
                    Add to cart
                  </h2>
                  <p className="mt-1 text-sm text-[#7b8178]">
                    Choose how many you'd like.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  disabled={addingToCart}
                  className="rounded-full bg-white/80 p-2.5 text-[#526247] transition hover:rotate-90 hover:bg-white disabled:opacity-50"
                  aria-label="Close add to cart"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex gap-4 rounded-2xl border border-[#e8ebdf] bg-[#fafbf8] p-3">
                {selectedProduct.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[#edf3e7] text-[#7b965c]">
                    <Package size={30} />
                  </div>
                )}

                <div className="min-w-0 flex-1 py-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#7b965c]">
                    {selectedProduct.category}
                  </span>
                  <h3 className="mt-1 font-bold text-[#24301f]">
                    {selectedProduct.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7b8178]">
                    {selectedProduct.description}
                  </p>
                  <p className="mt-2 text-lg font-extrabold text-[#35452b]">
                    ₹{selectedProduct.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-bold text-[#35452b]">Quantity</span>
                  <span className="rounded-full bg-[#edf3e7] px-3 py-1 text-xs font-semibold text-[#657d4d]">
                    {selectedProduct.stock} available
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#e2e7db] bg-white p-2">
                  <button
                    type="button"
                    onClick={decreaseSelectedQuantity}
                    disabled={selectedQuantity <= 1 || addingToCart}
                    aria-label="Decrease selected quantity"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef3e9] text-[#526b3d] transition hover:bg-[#dfe9d5] disabled:opacity-40"
                  >
                    <Minus size={19} />
                  </button>

                  <span className="text-xl font-extrabold text-[#24301f]">
                    {selectedQuantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseSelectedQuantity}
                    disabled={
                      selectedQuantity >= selectedProduct.stock ||
                      addingToCart
                    }
                    aria-label="Increase selected quantity"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef3e9] text-[#526b3d] transition hover:bg-[#dfe9d5] disabled:opacity-40"
                  >
                    <Plus size={19} />
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#edf3e7] to-[#f7f5e9] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#7b8178]">
                      Subtotal
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#526247]">
                      ₹{selectedProduct.price} × {selectedQuantity}
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-[#35452b]">
                    ₹
                    {(
                      selectedProduct.price * selectedQuantity
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {cartError && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {cartError}
                </p>
              )}

              <button
                type="button"
                onClick={() => void confirmAddToCart()}
                disabled={addingToCart}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7b965c] py-4 font-bold text-white shadow-lg shadow-[#7b965c]/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#657d4d] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addingToCart ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Adding to cart...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    Add {selectedQuantity}{" "}
                    {selectedQuantity === 1 ? "item" : "items"} to cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => buyNow(selectedProduct)}
                disabled={addingToCart}
                className="mt-3 w-full rounded-2xl border border-[#dce4d2] py-3.5 font-semibold text-[#657d4d] transition hover:bg-[#f0f5eb] disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-[70] bg-[#172016]/45 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            onClick={(event) => event.stopPropagation()}
            className="absolute right-0 top-0 flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-md"
            style={{ animation: "shopFadeIn .25s ease-out both" }}
          >
            <div className="flex items-center justify-between border-b border-[#e9ece4] bg-gradient-to-r from-[#f3f6ee] to-white px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#e4ecd9] p-3 text-[#657d4d]">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#24301f]">
                    Your cart
                  </h2>
                  <p className="mt-1 text-sm text-[#7b8178]">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full p-2.5 text-[#526247] transition hover:rotate-90 hover:bg-[#e9eee3]"
                aria-label="Close cart"
              >
                <X size={21} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#edf3e7] text-[#7b965c]">
                    <ShoppingBag size={35} />
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold text-[#24301f]">
                    Your cart is empty
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[#7b8178]">
                    Your next favourite snack is waiting to be discovered.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="mt-6 rounded-full bg-[#7b965c] px-6 py-3 font-semibold text-white transition hover:bg-[#657d4d]"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-2xl border border-[#e7eade] p-3 transition duration-200 hover:border-[#cbd9bb] hover:shadow-sm"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-24 w-24 shrink-0 rounded-xl bg-[#f1f3ee] object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[#edf3e7] text-[#7b965c]">
                          <Package size={27} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#7b965c]">
                              {item.category}
                            </p>
                            <h3 className="mt-1 font-bold text-[#24301f]">
                              {item.name}
                            </h3>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="rounded-lg p-1.5 text-[#9a9f94] transition hover:bg-red-50 hover:text-red-500"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X size={17} />
                          </button>
                        </div>

                        <p className="mt-2 text-sm font-bold text-[#35452b]">
                          ₹
                          {(
                            item.price * item.quantity
                          ).toLocaleString("en-IN")}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="text-xs text-[#8a9182]">
                            {item.weight}
                          </span>

                          <div className="flex items-center gap-3 rounded-full border border-[#e2e7db] bg-[#fafbf8] px-2 py-1.5">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                              aria-label={`Decrease ${item.name} quantity`}
                              className="text-[#657d4d] transition hover:scale-110"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="min-w-4 text-center text-sm font-bold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.id)}
                              disabled={item.quantity >= item.stock}
                              aria-label={`Increase ${item.name} quantity`}
                              className="text-[#657d4d] transition hover:scale-110 disabled:opacity-40"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-[#e8ebe2] bg-[#fafbf8] p-6">
                <div className="mb-3 flex justify-between text-sm">
                  <span className="text-[#7b8178]">Subtotal</span>
                  <span className="font-semibold text-[#35452b]">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mb-5 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-[#24301f]">
                    Total
                  </span>
                  <span className="text-2xl font-extrabold text-[#657d4d]">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={checkoutCart}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7b965c] py-4 font-bold text-white shadow-lg shadow-[#7b965c]/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#657d4d] hover:shadow-xl"
                >
                  Proceed to checkout
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                <p className="mt-3 text-center text-xs text-[#8a9182]">
                  Shipping and final totals are confirmed at checkout.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Floating cart button */}
      {cartCount > 0 && !cartOpen && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="group fixed bottom-5 right-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-full bg-[#24301f] px-5 py-3.5 font-semibold text-white shadow-2xl shadow-[#24301f]/25 transition duration-300 hover:-translate-y-1 hover:bg-[#35452b] sm:bottom-7 sm:right-7"
          aria-label={`Open cart with ${cartCount} items`}
        >
          <span className="relative">
            <ShoppingBag size={20} />
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dce8ce] px-1 text-[10px] font-extrabold text-[#35452b]">
              {cartCount}
            </span>
          </span>

          <span className="whitespace-nowrap">
            Cart · ₹{cartTotal.toLocaleString("en-IN")}
          </span>

          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      )}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  index: number;
  onAdd: () => void;
  onBuyNow: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  onAdd,
  onBuyNow,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <article
      className="shop-product-card group relative flex h-full flex-col overflow-hidden rounded-[1.7rem] border border-[#e5e8df] bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#c9d8b8] hover:shadow-xl hover:shadow-[#35452b]/10"
      style={{
        animationDelay: `${Math.min(index % 8, 7) * 75}ms`,
      }}
    >
      {/* Product image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f0f2eb]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[#9a9f94]">
            <Package size={38} />
            <span className="text-sm">No image available</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#657d4d] shadow-sm backdrop-blur">
          {product.category}
        </span>

        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#24301f]/45 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-red-600 shadow-lg">
              Out of stock
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-[#a94438] px-3 py-1.5 text-xs font-bold text-white shadow-md">
            Only {product.stock} left
          </span>
        ) : (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#526247] shadow-sm backdrop-blur">
            <CheckCircle2 size={13} className="text-[#7b965c]" />
            In stock
          </span>
        )}

        <div className="absolute right-3 top-3 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-white/90 text-[#7b965c] opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Heart size={18} />
        </div>
      </div>

      {/* Product information */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7dd] px-2.5 py-1.5 text-xs font-bold text-[#85691f]">
            <Star size={13} className="fill-current text-amber-400" />
            {product.rating.toFixed(1)}
          </div>

          <span className="text-xs text-[#9a9f94]">
            {product.reviews > 0
              ? `${product.reviews} reviews`
              : "Customer favourite"}
          </span>
        </div>

        <h3 className="line-clamp-1 text-lg font-extrabold text-[#24301f] transition-colors duration-300 group-hover:text-[#657d4d]">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm leading-[1.4rem] text-[#7b8178]">
          {product.description || "A delicious pick for your everyday snack time."}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#edf0e8] pt-4">
          <div>
            <p className="text-xs text-[#9a9f94]">Price</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#35452b]">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-[#9a9f94]">
              {product.weight}
            </p>
          </div>

          <span className="pb-1 text-right text-xs text-[#8a9182]">
            {product.stock > 0
              ? `${product.stock} available`
              : "Unavailable"}
          </span>
        </div>

        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={onAdd}
            disabled={isOutOfStock}
            className="group/add flex w-full items-center justify-center gap-2 rounded-xl bg-[#7b965c] px-4 py-3.5 font-bold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#657d4d] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
          >
            <ShoppingBag
              size={18}
              className="transition-transform duration-300 group-hover/add:-rotate-6 group-hover/add:scale-110"
            />
            {isOutOfStock ? "Out of stock" : "Add to cart"}
          </button>

          <button
            type="button"
            onClick={onBuyNow}
            disabled={isOutOfStock}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce4d2] bg-white px-4 py-3 font-semibold text-[#657d4d] transition duration-300 hover:border-[#7b965c] hover:bg-[#f2f6ed] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Buy now
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  index: number;
}

const Feature: React.FC<FeatureProps> = ({
  icon,
  title,
  text,
  index,
}) => (
  <div
    className="shop-reveal group rounded-3xl border border-[#e8ebe3] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#c9d8b8] hover:shadow-lg hover:shadow-[#35452b]/5 sm:p-6"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3e7] text-[#6e8951] transition duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-[#7b965c] group-hover:text-white">
      {icon}
    </div>

    <h3 className="font-extrabold text-[#35452b]">{title}</h3>

    <p className="mt-2 text-sm leading-6 text-[#7b8178]">
      {text}
    </p>
  </div>
);

export default Shop;
