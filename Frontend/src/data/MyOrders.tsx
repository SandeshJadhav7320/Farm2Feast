
import { useEffect, useState } from "react";
import {
  Package,
  RefreshCw,
  MapPin,
  CreditCard,
  Truck,
  ExternalLink,
  ShoppingBag,
  Leaf,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  CheckCircle2,
  Clock,
} from "lucide-react";

const API_URL = "http://localhost:8080";

type OrderItem = {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string | null;
};

type Order = {
  id: number;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  deliveryCompany?: string | null;
  trackingNumber?: string | null;
  items: OrderItem[];
};

const statusStyles: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700 border-amber-200",
  PLACED: "bg-blue-50 text-blue-700 border-blue-200",
  CONFIRMED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED: "bg-orange-50 text-orange-700 border-orange-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTrackingUrl(company?: string | null): string | null {
  if (!company) return null;

  const courier = company.trim().toLowerCase();

  if (courier.includes("delhivery")) {
    return "https://www.delhivery.com/track/package/";
  }

  if (courier.includes("blue dart") || courier.includes("bluedart")) {
    return "https://www.bluedart.com/tracking";
  }

  if (courier.includes("dtdc")) {
    return "https://www.dtdc.in/tracking.asp";
  }

  if (courier.includes("india post") || courier.includes("indiapost")) {
    return "https://www.indiapost.gov.in/";
  }

  if (courier.includes("ecom express")) {
    return "https://ecomexpress.in/";
  }

  if (courier.includes("xpressbees")) {
    return "https://www.xpressbees.com/";
  }

  return null;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "DELIVERED") {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  if (status === "SHIPPED") {
    return <Truck className="h-3.5 w-3.5" />;
  }

  return <Clock className="h-3.5 w-3.5" />;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  async function fetchOrders() {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setError("Please sign in to view your orders.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/user/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your session may have expired. Please sign in again."
        );
      }

      if (!response.ok) {
        throw new Error("Unable to load your orders. Please try again.");
      }

      const data: Order[] = await response.json();
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchOrders();
  }, []);

  function toggleOrder(orderId: number) {
    setExpandedOrders((previous) =>
      previous.includes(orderId)
        ? previous.filter((id) => id !== orderId)
        : [...previous, orderId]
    );
  }

  return (
    <section className="orders-compact min-h-screen bg-[#f7f8f1] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <style>{`
        @keyframes orderCardEnter {
          from {
            opacity: 0;
            transform: translateY(14px) scale(.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes orderContentEnter {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .compact-order-card {
          animation: orderCardEnter .45s ease-out both;
          transition: border-color .25s ease, box-shadow .25s ease,
            transform .25s ease;
        }

        .compact-order-card:hover {
          border-color: #c4d8b9;
          box-shadow: 0 12px 28px rgba(38, 72, 32, .08);
          transform: translateY(-2px);
        }

        .compact-order-details {
          animation: orderContentEnter .3s ease-out both;
        }

        .compact-order-image {
          transition: transform .3s ease;
        }

        .compact-order-product:hover .compact-order-image {
          transform: scale(1.06);
        }

        @media (prefers-reduced-motion: reduce) {
          .orders-compact *,
          .orders-compact *::before,
          .orders-compact *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="animate-[orderContentEnter_.5s_ease-out_both]">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-700">
              <Leaf className="h-4 w-4" />
              Farm2Feast
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-2 text-sm text-ink-600">
              Your purchases, neatly organized in one place.
            </p>
          </div>

          <button
            onClick={() => void fetchOrders()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-primary-400 hover:bg-green-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-cream-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-cream-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 rounded bg-cream-200" />
                    <div className="h-3 w-40 rounded bg-cream-100" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-cream-200" />
                </div>
              </div>
            ))}

            <p className="py-2 text-center text-sm text-ink-500">
              Loading your orders...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-red-700">{error}</p>

            <button
              onClick={() => void fetchOrders()}
              className="mt-4 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-cream-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-primary-600">
              <Package className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-ink-900">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-ink-600">
              Your orders will appear here after your first purchase.
            </p>

            <a
              href="/shop"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              <ShoppingBag className="h-4 w-4" />
              Explore products
            </a>
          </div>
        )}

        {/* Compact order cards */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order, index) => {
              const expanded = expandedOrders.includes(order.id);

              return (
                <article
                  key={order.id}
                  className="compact-order-card overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  {/* Small card summary */}
                  <button
                    type="button"
                    onClick={() => toggleOrder(order.id)}
                    aria-expanded={expanded}
                    className="flex w-full items-center gap-3 p-3.5 text-left sm:gap-4 sm:p-4"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-primary-700 ring-1 ring-green-100 transition duration-300 hover:bg-green-100 sm:h-14 sm:w-14">
                      <Package className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-ink-900 sm:text-base">
                          Order #{order.id}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold sm:text-xs ${
                            statusStyles[order.status] ??
                            "border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        >
                          <StatusIcon status={order.status} />
                          {formatStatus(order.status)}
                        </span>
                      </div>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500 sm:text-sm">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        {formatDate(order.createdAt)}
                      </p>

                      <p className="mt-1 text-xs text-ink-600">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500 sm:text-xs">
                        Total
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-primary-700 sm:text-base">
                        {formatPrice(order.totalAmount)}
                      </p>

                      <div className="mt-1 flex justify-end text-ink-500">
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expandable card details */}
                  {expanded && (
                    <div className="compact-order-details border-t border-cream-200 bg-[#fdfdf9] p-3.5 sm:p-4">
                      {/* Items */}
                      <div className="mb-4">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-600">
                          Products
                        </h3>

                        <div className="space-y-2">
                          {order.items.map((item, itemIndex) => (
                            <div
                              key={`${order.id}-${item.productId}-${itemIndex}`}
                              className="compact-order-product flex items-center gap-3 rounded-xl border border-cream-200 bg-white p-2.5 transition hover:border-green-200"
                            >
                              {item.imageUrl ? (
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream-50">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    loading="lazy"
                                    className="compact-order-image h-full w-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-primary-600">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-ink-900">
                                  {item.productName}
                                </p>
                                <p className="mt-1 text-xs text-ink-500">
                                  {item.quantity} × {formatPrice(item.unitPrice)}
                                </p>
                              </div>

                              <p className="shrink-0 text-sm font-bold text-ink-900">
                                {formatPrice(item.subtotal)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Address and payment details */}
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex items-start gap-2.5 rounded-xl border border-cream-200 bg-white p-3">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-ink-900">
                              Delivery address
                            </p>
                            <p className="mt-1 break-words text-xs leading-5 text-ink-600">
                              {order.deliveryAddress}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 rounded-xl border border-cream-200 bg-white p-3">
                          <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-ink-900">
                              Payment details
                            </p>
                            <p className="mt-1 break-words text-xs leading-5 text-ink-600">
                              {order.paymentMethod}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-ink-700">
                              {formatStatus(order.paymentStatus)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Shipping details */}
                      {(order.deliveryCompany || order.trackingNumber) && (
                        <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-700" />
                            <h3 className="text-xs font-bold text-ink-900">
                              Shipping & tracking
                            </h3>
                          </div>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                                Delivery company
                              </p>
                              <p className="mt-1 break-words text-xs font-semibold text-ink-900">
                                {order.deliveryCompany || "Not assigned yet"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                                Tracking number
                              </p>
                              <p className="mt-1 break-all text-xs font-semibold text-ink-900">
                                {order.trackingNumber || "Not available yet"}
                              </p>
                            </div>
                          </div>

                          {order.trackingNumber && (
                            <div className="mt-3">
                              {getTrackingUrl(order.deliveryCompany) ? (
                                <a
                                  href={getTrackingUrl(order.deliveryCompany)!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(event) => event.stopPropagation()}
                                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-800"
                                >
                                  <Truck className="h-4 w-4" />
                                  Track product
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              ) : (
                                <p className="text-xs leading-5 text-ink-600">
                                  Online tracking is not configured for this
                                  delivery company.
                                </p>
                              )}

                              <p className="mt-2 text-[10px] leading-4 text-ink-500">
                                The courier website may ask you to enter the
                                tracking number above.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Total */}
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-green-100 bg-green-50/80 px-3.5 py-3">
                        <span className="text-xs font-semibold text-ink-700">
                          Order total
                        </span>
                        <span className="text-base font-extrabold text-primary-700">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <p className="mt-5 text-center text-xs text-ink-500">
            Select any order card to view its full details.
          </p>
        )}
      </div>
    </section>
  );
}
