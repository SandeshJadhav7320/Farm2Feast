import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: number;
  totalPrice: number;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("token");

        if (!token) {
          navigate("/signin");
          return;
        }

        const response = await fetch(
          "https://farm2feast.onrender.com/api/cart",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");

          navigate("/signin");
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Failed to fetch cart. Status: ${response.status}`
          );
        }

        const data: CartItem[] = await response.json();

        console.log("Cart from backend:", data);

        setCartItems(data);
      } catch (err) {
        console.error("Cart fetch error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your cart."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.totalPrice,
    0
  );

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleCheckout = () => {
  if (cartItems.length === 0) {
    return;
  }

  const checkoutItems = cartItems.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    unitPrice: item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl,
  }));

  sessionStorage.setItem(
    "checkoutItems",
    JSON.stringify(checkoutItems)
  );

  navigate("/checkout");
};

  return (
    <main className="min-h-screen bg-[#faf9f5] px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-10">
          <Link
            to="/shop"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7b965c] transition hover:text-[#657d4d]"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#7b965c]">
                Your Cart
              </p>

              <h1 className="text-3xl font-bold sm:text-4xl">
                Your favourite products
              </h1>

              {!loading && (
                <p className="mt-2 text-gray-500">
                  {cartCount}{" "}
                  {cartCount === 1 ? "item" : "items"} in your cart
                </p>
              )}
            </div>

            <ShoppingBag
              className="hidden text-[#7b965c] sm:block"
              size={40}
            />
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse gap-5 rounded-3xl bg-white p-5"
                >
                  <div className="h-28 w-28 rounded-2xl bg-gray-200" />

                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/2 rounded bg-gray-200" />
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-5 w-1/4 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>

            <div className="h-64 animate-pulse rounded-3xl bg-gray-200" />
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <h2 className="text-xl font-bold text-red-700">
              Unable to load cart
            </h2>

            <p className="mt-2 text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY CART */}
        {!loading &&
          !error &&
          cartItems.length === 0 && (
            <div className="rounded-3xl bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#eef3e9]">
                <ShoppingBag
                  size={34}
                  className="text-[#7b965c]"
                />
              </div>

              <h2 className="text-2xl font-bold">
                Your cart is empty
              </h2>

              <p className="mx-auto mt-2 max-w-md text-gray-500">
                You haven't added any products yet.
                Explore our collection and find your
                favourite snacks.
              </p>

              <Link
                to="/shop"
                className="mt-7 inline-flex rounded-full bg-[#7b965c] px-7 py-3 font-semibold text-white transition hover:bg-[#657d4d]"
              >
                Start Shopping
              </Link>
            </div>
          )}

        {/* CART */}
        {!loading &&
          !error &&
          cartItems.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

              {/* ITEMS */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="rounded-3xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex gap-5">

                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-28 w-28 shrink-0 rounded-2xl object-cover"
                      />

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-lg font-bold">
                              {item.productName}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                              {item.description}
                            </p>
                          </div>

                          <button
                            className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                            aria-label={`Remove ${item.productName}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                          <div>
                            <p className="text-sm text-gray-500">
                              Price
                            </p>

                            <p className="text-lg font-bold">
                              ₹{item.price}
                            </p>
                          </div>

                          {/* QUANTITY */}
                          <div className="flex items-center gap-3 rounded-full border border-[#dfe4da] px-2 py-1.5">
                            <button
                              className="rounded-full p-1.5 text-[#617950] hover:bg-[#eef3e9]"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>

                            <span className="min-w-6 text-center font-semibold">
                              {item.quantity}
                            </span>

                            <button
                              className="rounded-full p-1.5 text-[#617950] hover:bg-[#eef3e9]"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              Total
                            </p>

                            <p className="text-lg font-bold text-[#24301f]">
                              ₹{item.totalPrice}
                            </p>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SUMMARY */}
              <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-28">
                <h2 className="text-xl font-bold">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Items
                    </span>

                    <span className="font-semibold">
                      {cartCount}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-semibold">
                      ₹{cartTotal}
                    </span>
                  </div>

                  <div className="flex justify-between border-t pt-4">
                    <span className="font-bold">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-[#7b965c]">
                      ₹{cartTotal}
                    </span>
                  </div>
                </div>
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0}
                      className="mt-7 w-full rounded-2xl bg-[#7b965c] py-4 font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#657d4d] hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Proceed to Checkout
                    </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                  Taxes and shipping calculated at checkout.
                </p>
              </aside>
            </div>
          )}
      </div>
    </main>
  );
};

export default Cart;