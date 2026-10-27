
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownUp,
  ChevronDown,
  LoaderCircle,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

// These values must match your Java OrderStatus enum exactly.
const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatus = string;

interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string | null;
}

interface Order {
  id: number;
  deliveryName: string;
  phoneNumber: string;
  deliveryAddress: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  deliveryCompany: string | null;
  trackingNumber: string | null;
  items: OrderItem[];
}

type StatusFilter = "ALL" | OrderStatus;

function getToken(): string | null {
  return sessionStorage.getItem("token");
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value: string): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readableStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function statusClasses(status: string): string {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "SHIPPED":
      return "bg-blue-100 text-blue-800";
    case "PROCESSING":
      return "bg-purple-100 text-purple-800";
    case "CONFIRMED":
      return "bg-teal-100 text-teal-800";
    case "PENDING_PAYMENT":
      return "bg-amber-100 text-amber-800";
    case "PLACED":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notice, setNotice] = useState("");
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [deliveryCompany, setDeliveryCompany] = useState("Delhivery");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingSubmitting, setShippingSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest<Order[]>("/api/admin/orders");
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load orders.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      const matchesSearch =
        !query ||
        String(order.id).includes(query) ||
        (order.deliveryName || "").toLowerCase().includes(query) ||
        (order.phoneNumber || "").toLowerCase().includes(query) ||
        (order.deliveryAddress || "").toLowerCase().includes(query) ||
        order.items.some((item) =>
          (item.productName || "").toLowerCase().includes(query),
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: orders.length,
      placed: orders.filter((order) => order.status === "PLACED").length,
      processing: orders.filter((order) =>
        ["CONFIRMED", "PROCESSING"].includes(order.status),
      ).length,
      delivered: orders.filter((order) => order.status === "DELIVERED").length,
    };
  }, [orders]);

  async function handleStatusChange(
    order: Order,
    newStatus: string,
  ) {
    if (newStatus === order.status || updatingId !== null) return;

    if (
      order.status === "CANCELLED" &&
      newStatus !== "CANCELLED"
    ) {
      setNotice("Cancelled orders cannot be reopened.");
      return;
    }

    const previousOrders = orders;

    setUpdatingId(order.id);
    setError("");
    setNotice("");

    // Optimistically update the row while the request is in progress.
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id ? { ...item, status: newStatus } : item,
      ),
    );

    try {
      const updatedOrder = await apiRequest<Order>(
        `/api/admin/orders/${order.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        },
      );

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? updatedOrder : item,
        ),
      );

      setSelectedOrder((current) =>
        current?.id === order.id ? updatedOrder : current,
      );

      setNotice(`Order #${order.id} updated to ${readableStatus(updatedOrder.status)}.`);
    } catch (err) {
      setOrders(previousOrders);
      setError(
        err instanceof Error
          ? err.message
          : "Could not update the order status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleShipOrder() {
  if (!shippingOrder) return;

  const tracking = trackingNumber.trim();

  if (!deliveryCompany || !tracking) {
    setError("Please select a delivery company and enter a tracking number.");
    return;
  }

  setShippingSubmitting(true);
  setError("");
  setNotice("");

  try {
    const updatedOrder = await apiRequest<Order>(
      `/api/admin/orders/${shippingOrder.id}/ship`,
      {
        method: "PATCH",
        body: JSON.stringify({
          deliveryCompany,
          trackingNumber: tracking,
        }),
      }
    );

    setOrders((current) =>
      current.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );

    setSelectedOrder((current) =>
      current?.id === updatedOrder.id ? updatedOrder : current
    );

    setNotice(`Order #${updatedOrder.id} has been shipped successfully.`);
    setShippingOrder(null);
    setTrackingNumber("");
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to ship the order."
    );
  } finally {
    setShippingSubmitting(false);
  }
}

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>x
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-700">
              <ShoppingBag size={17} />
              Farm2Feast Admin
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              Orders Management
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Review customer orders and keep delivery statuses up to date.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchOrders()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-100 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh orders
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            label="All orders"
            value={counts.total}
            icon={<Package size={20} />}
          />
          <SummaryCard
            label="Placed"
            value={counts.placed}
            icon={<ShoppingBag size={20} />}
          />
          <SummaryCard
            label="In progress"
            value={counts.processing}
            icon={<ArrowDownUp size={20} />}
          />
          <SummaryCard
            label="Delivered"
            value={counts.delivered}
            icon={<Truck size={20} />}
          />
        </div>

        {/* Errors and success messages */}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 break-words">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {notice && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer, phone, address or product..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="relative sm:w-56">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-stone-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="ALL">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {readableStatus(status)}
                </option>
              ))}
              {/* Include unexpected statuses already returned by the API. */}
              {[...new Set(orders.map((order) => order.status))]
                .filter((status) => !ORDER_STATUSES.includes(status as never))
                .map((status) => (
                  <option key={status} value={status}>
                    {readableStatus(status)}
                  </option>
                ))}
            </select>
            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
            />
          </div>
        </div>

        {/* Orders table */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <h2 className="font-semibold text-stone-900">Customer orders</h2>
            <span className="text-sm text-stone-500">
              {filteredOrders.length} result{filteredOrders.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-stone-500">
              <LoaderCircle size={30} className="animate-spin text-green-700" />
              <p className="text-sm">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 rounded-full bg-stone-100 p-4">
                <Package size={28} className="text-stone-400" />
              </div>
              <p className="font-semibold text-stone-800">No orders found</p>
              <p className="mt-1 text-sm text-stone-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Order</th>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Items</th>
                    <th className="px-5 py-4 font-semibold">Total</th>
                    <th className="px-5 py-4 font-semibold">Payment</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Update status</th>
                    <th className="px-5 py-4 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="align-top transition hover:bg-stone-50/70">
                      <td className="px-5 py-5">
                        <p className="font-bold text-stone-900">
                          #{order.id}
                        </p>
                        <p className="mt-1 whitespace-nowrap text-xs text-stone-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>

                      <td className="max-w-56 px-5 py-5">
                        <p className="font-semibold text-stone-900">
                          {order.deliveryName}
                        </p>
                        <p className="mt-1 text-stone-600">
                          {order.phoneNumber}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">
                          {order.deliveryAddress}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-medium text-stone-800">
                          {order.items?.length ?? 0} product type(s)
                        </p>
                        <p className="mt-1 max-w-48 text-xs leading-5 text-stone-500">
                          {(order.items ?? [])
                            .map((item) => `${item.productName} × ${item.quantity}`)
                            .join(", ")}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 font-bold text-stone-900">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-medium text-stone-800">
                          {readableStatus(order.paymentMethod || "—")}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          Payment: {readableStatus(order.paymentStatus || "—")}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses(order.status)}`}>
                          {readableStatus(order.status)}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="relative min-w-44">
                          <select
                            aria-label={`Update status for order ${order.id}`}
                            value={order.status}
                            disabled={
                              updatingId !== null ||
                              order.status === "CANCELLED"
                            }
                            onChange={(event) => {
                              const newStatus = event.target.value;

                              if (newStatus === "SHIPPED" && order.status !== "SHIPPED") {
                                setDeliveryCompany("Delhivery");
                                setTrackingNumber("");
                                setShippingOrder(order);
                                setError("");
                                return;
                              }

                              void handleStatusChange(order, newStatus);
                            }}
                            className="w-full appearance-none rounded-lg border border-stone-200 bg-white px-3 py-2.5 pr-8 text-xs font-medium outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:opacity-70"
                          >
                            {!ORDER_STATUSES.includes(order.status as never) && (
                              <option value={order.status}>
                                {readableStatus(order.status)}
                              </option>
                            )}
                            {ORDER_STATUSES.map((status) => (
                              <option
                                key={status}
                                value={status}
                                disabled={
                                  order.status === "CANCELLED" &&
                                  status !== "CANCELLED"
                                }
                              >
                                {readableStatus(status)}
                              </option>
                            ))}
                          </select>
                          {updatingId === order.id ? (
                            <LoaderCircle
                              size={15}
                              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-green-700"
                            />
                          ) : (
                            <ChevronDown
                              size={15}
                              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-500"
                            />
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        
                        <button
                          type="button"
                          onClick={() => {
                            // Open the latest order data from the orders list.
                            const latestOrder = orders.find((item) => item.id === order.id);
                            setSelectedOrder(latestOrder ?? order);
                          }}
                          className="whitespace-nowrap rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-800"
                        >
                          View order
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs leading-5 text-stone-500">
          Status changes are saved to the backend. Cancelled orders cannot be
          reopened using the current backend service.
        </p>
      </div>


          {/* Ship order modal */}
          {shippingOrder && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="ship-order-title"
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2
                      id="ship-order-title"
                      className="text-xl font-bold text-stone-900"
                    >
                      Ship Order #{shippingOrder.id}
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">
                      Enter the delivery and tracking details.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={shippingSubmitting}
                    onClick={() => setShippingOrder(null)}
                    className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 disabled:opacity-50"
                    aria-label="Close shipping form"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleShipOrder();
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="delivery-company"
                      className="mb-2 block text-sm font-semibold text-stone-700"
                    >
                      Delivery company
                    </label>

                    <select
                      id="delivery-company"
                      value={deliveryCompany}
                      onChange={(event) => setDeliveryCompany(event.target.value)}
                      required
                      disabled={shippingSubmitting}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    >
                      <option value="Delhivery">Delhivery</option>
                      <option value="Blue Dart">Blue Dart</option>
                      <option value="DTDC">DTDC</option>
                      <option value="India Post">India Post</option>
                      <option value="Ecom Express">Ecom Express</option>
                      <option value="XpressBees">XpressBees</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="tracking-number"
                      className="mb-2 block text-sm font-semibold text-stone-700"
                    >
                      Tracking number
                    </label>

                    <input
                      id="tracking-number"
                      type="text"
                      value={trackingNumber}
                      onChange={(event) => setTrackingNumber(event.target.value)}
                      placeholder="e.g. DLV123456789"
                      required
                      maxLength={100}
                      disabled={shippingSubmitting}
                      className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={shippingSubmitting}
                      onClick={() => setShippingOrder(null)}
                      className="rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        shippingSubmitting ||
                        !deliveryCompany ||
                        !trackingNumber.trim()
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {shippingSubmitting && (
                        <LoaderCircle size={16} className="animate-spin" />
                      )}
                      {shippingSubmitting ? "Submitting..." : "Submit Shipment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}


      {/* Order details modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-dialog-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-start justify-between border-b border-stone-100 bg-white p-5">
              <div>
                <p className="text-sm text-stone-500">Order details</p>
                <h2
                  id="order-dialog-title"
                  className="mt-1 text-xl font-bold text-stone-900"
                >
                  Order #{selectedOrder.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Customer" value={selectedOrder.deliveryName} />
                <Detail label="Phone" value={selectedOrder.phoneNumber} />
                <Detail
                  label="Order date"
                  value={formatDate(selectedOrder.createdAt)}
                />
                <Detail
                  label="Delivery address"
                  value={selectedOrder.deliveryAddress}
                />
                <Detail
                  label="Payment method"
                  value={readableStatus(selectedOrder.paymentMethod || "—")}
                />
                <Detail
                  label="Payment status"
                  value={readableStatus(selectedOrder.paymentStatus || "—")}
                />
              </div>

              {/* Shipping information */}
              {(selectedOrder.deliveryCompany ||
                selectedOrder.trackingNumber) && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                    <Truck size={18} />
                    Shipping information
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Detail
                      label="Delivery company"
                      value={selectedOrder.deliveryCompany || "—"}
                    />

                    <Detail
                      label="Tracking number"
                      value={selectedOrder.trackingNumber || "—"}
                    />
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-3 font-semibold text-stone-900">
                  Ordered products
                </h3>
                <div className="divide-y divide-stone-100 rounded-xl border border-stone-200">
                  {(selectedOrder.items ?? []).map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex items-center gap-3 p-3"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-14 w-14 rounded-lg border border-stone-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-stone-100">
                          <Package size={22} className="text-stone-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-stone-900">
                          {item.productName}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <p className="whitespace-nowrap font-semibold text-stone-800">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-green-50 p-4">
                  <span className="font-semibold text-stone-700">
                    Order total
                  </span>
                  <span className="text-xl font-bold text-green-800">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-order-status"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Update order status
                </label>
                <select
                  id="modal-order-status"
                  value={selectedOrder.status}
                  disabled={
                    updatingId !== null ||
                    selectedOrder.status === "CANCELLED"
                  }
                  onChange={(event) => {
                    const newStatus = event.target.value;

                    if (
                      newStatus === "SHIPPED" &&
                      selectedOrder.status !== "SHIPPED"
                    ) {
                      setDeliveryCompany("Delhivery");
                      setTrackingNumber("");
                      setShippingOrder(selectedOrder);
                      setError("");
                      return;
                    }

                    void handleStatusChange(selectedOrder, newStatus);
                  }}
                  className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-stone-100"
                >
                  {!ORDER_STATUSES.includes(selectedOrder.status as never) && (
                    <option value={selectedOrder.status}>
                      {readableStatus(selectedOrder.status)}
                    </option>
                  )}
                  {ORDER_STATUSES.map((status) => (
                    <option
                      key={status}
                      value={status}
                      disabled={
                        selectedOrder.status === "CANCELLED" &&
                        status !== "CANCELLED"
                      }
                    >
                      {readableStatus(status)}
                    </option>
                  ))}
                </select>
                {updatingId === selectedOrder.id && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-stone-500">
                    <LoaderCircle size={14} className="animate-spin" />
                    Saving status...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-stone-500">{label}</p>
        <span className="rounded-xl bg-green-50 p-2 text-green-700">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-stone-900">
        {value || "—"}
      </p>
    </div>
  );
}
