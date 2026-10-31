
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Leaf,
  LockKeyhole,
  MapPin,
  Minus,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";

const API_URL = "https://farm2feast.onrender.com";

interface CheckoutItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

interface OrderResponse {
  id?: number;
  status?: string;
  totalAmount?: number;
  message?: string;
}

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  const [deliveryName, setDeliveryName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [placedOrder, setPlacedOrder] =
    useState<OrderResponse | null>(null);

  const checkoutItems: CheckoutItem[] = useMemo(() => {
    try {
      const savedItems = sessionStorage.getItem("checkoutItems");

      if (!savedItems) return [];

      const parsed: unknown = JSON.parse(savedItems);

      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (item): item is CheckoutItem =>
          item !== null &&
          typeof item === "object" &&
          Number.isFinite(Number(item.productId)) &&
          Number(item.productId) > 0 &&
          Number.isFinite(Number(item.quantity)) &&
          Number(item.quantity) > 0 &&
          Number.isFinite(Number(item.unitPrice)) &&
          Number(item.unitPrice) >= 0
      );
    } catch {
      return [];
    }
  }, []);

  const itemCount = checkoutItems.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  const subtotal = checkoutItems.reduce(
    (sum, item) =>
      sum + Number(item.unitPrice) * Number(item.quantity),
    0
  );

  const deliveryFee = 0;
  const totalAmount = subtotal + deliveryFee;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    if (checkoutItems.length === 0) {
      setError("Your checkout is empty. Please select a product first.");
      return;
    }

    if (!deliveryName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phoneNumber.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (deliveryAddress.trim().length < 10) {
      setError("Please enter your complete delivery address.");
      return;
    }

    const requestBody = {
      deliveryName: deliveryName.trim(),
      phoneNumber: phoneNumber.trim(),
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      items: checkoutItems.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      })),
    };

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/api/user/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (response.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to place this order. Please check your account."
        );
      }

      if (!response.ok) {
        throw new Error(
          responseText || `Unable to place order (${response.status}).`
        );
      }

      let order: OrderResponse | null = null;

      if (responseText.trim()) {
        try {
          order = JSON.parse(responseText) as OrderResponse;
        } catch {
          // The API may return a plain-text success message.
        }
      }

      setPlacedOrder(order);
      setSuccess(
        order?.id
          ? `Your order #${order.id} has been placed successfully.`
          : responseText || "Your order has been placed successfully."
      );

      sessionStorage.removeItem("checkoutItems");
    } catch (err) {
      console.error("Place order error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Successful order confirmation
  if (success) {
    return (
      <main className="min-h-screen bg-[#f7f8f3] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-[2rem] border border-[#e5eadf] bg-white shadow-xl shadow-[#25351d]/5">
            <div className="bg-[#eaf2e3] px-6 py-12 text-center sm:px-12">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
                <CheckCircle2
                  size={52}
                  className="text-[#64864c]"
                  strokeWidth={1.7}
                />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[#6c8a57]">
                Order Confirmed
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#263321] sm:text-4xl">
                Thank you for your order!
              </h1>

              <p className="mx-auto mt-4 max-w-md leading-7 text-[#687362]">
                Your Farm2Feast order has been received. We look forward
                to delivering freshness to your doorstep.
              </p>
            </div>

            <div className="p-6 sm:p-10">
              {placedOrder?.id && (
                <div className="flex items-center justify-between rounded-2xl border border-[#e5eadf] bg-[#fafbf8] p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Order number
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#283622]">
                      #{placedOrder.id}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#e7f0df] px-3 py-2 text-sm font-bold text-[#527541]">
                    {placedOrder.status || "PLACED"}
                  </div>
                </div>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e8ebe4] p-5">
                  <Truck className="text-[#6d8c55]" size={24} />
                  <h2 className="mt-3 font-bold">Delivery details</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {deliveryName}
                    <br />
                    {phoneNumber}
                    <br />
                    {deliveryAddress}
                  </p>
                </div>

                <div className="rounded-xl border border-[#e8ebe4] p-5">
                  <CreditCard className="text-[#6d8c55]" size={24} />
                  <h2 className="mt-2 font-bold">Payment method</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Cash on Delivery
                  </p>
                  <p className="mt-3 text-xl font-bold text-[#283622]">
                    {currency(
                      Number(placedOrder?.totalAmount ?? totalAmount)
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/shop")}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6e8e54] px-6 py-4 font-bold text-white transition hover:bg-[#587442]"
              >
                Continue Shopping
                <ArrowRight size={19} />
              </button>

              <p className="mt-4 text-center text-xs text-gray-400">
                Thank you for choosing Farm2Feast.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Empty checkout
  if (checkoutItems.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f3] px-5 py-16">
        <div className="w-full max-w-lg rounded-[2rem] border border-[#e5eadf] bg-white p-8 text-center shadow-lg sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#edf3e7]">
            <ShoppingBag size={34} className="text-[#6e8e54]" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#283622]">
            Your checkout is empty
          </h1>

          <p className="mt-3 leading-7 text-gray-500">
            Your next favourite snack is waiting. Visit our shop and
            choose something fresh and delicious.
          </p>

          <button
            onClick={() => navigate("/shop")}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6e8e54] px-6 py-3.5 font-bold text-white hover:bg-[#587442]"
          >
            Explore the Shop
            <ArrowRight size={18} />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-[#293525]">
      {/* Top strip */}
      <div className="border-b border-[#e5e9df] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-2 text-sm font-semibold text-[#64745b] transition hover:text-[#283622]"
          >
            <ArrowLeft size={18} />
            <span>Back to shop</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6e8e54] text-white">
              <Leaf size={20} />
            </div>
            <div>
              <p className="text-base font-extrabold tracking-tight text-[#293525]">
                Farm2Feast
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#809174]">
                Freshness delivered
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs font-semibold text-[#657b55] sm:flex">
            <LockKeyhole size={15} />
            Secure checkout
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#e0e9d8] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#6b8955]">
            <ShieldCheck size={15} />
            Safe & simple checkout
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#293525] sm:text-3xl">
            Complete your order
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#788071] sm:text-base">
            A few details, and your favourite products will be on their
            way to you.
          </p>
        </div>

        {/* Progress */}
        <div className="mx-auto mt-8 flex max-w-md items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6e8e54] text-white">
              <Check size={17} />
            </span>
            <span className="text-xs font-bold text-[#536c42] sm:text-sm">
              Shopping
            </span>
          </div>

          <div className="mx-3 h-px flex-1 bg-[#cbd8bf] sm:mx-5" />

          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#293525] text-sm font-bold text-white">
              2
            </span>
            <span className="text-xs font-bold text-[#293525] sm:text-sm">
              Checkout
            </span>
          </div>

          <div className="mx-3 h-px flex-1 bg-[#dfe4d9] sm:mx-5" />

          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe4d9] bg-white text-sm font-bold text-gray-400">
              3
            </span>
            <span className="text-xs font-medium text-gray-400 sm:text-sm">
              Confirmation
            </span>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7">
          {/* Left column */}
          <div className="space-y-6">
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-2xl border border-[#e5e9df] bg-white shadow-sm shadow-[#25351d]/[0.03]"
            >
              <div className="border-b border-[#edf0e9] px-5 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf3e7] text-[#6e8e54]">
                    <MapPin size={23} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold sm:text-xl">
                      Delivery information
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 sm:p-6">
                <div>
                  <label
                    htmlFor="deliveryName"
                    className="mb-2 block text-sm font-bold text-[#35412e]"
                  >
                    Full name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91a087]"
                    />
                    <input
                      id="deliveryName"
                      type="text"
                      value={deliveryName}
                      onChange={(event) =>
                        setDeliveryName(event.target.value)
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      maxLength={100}
                      className="w-full rounded-xl border border-[#e1e6dc] bg-[#fdfefc] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#83a36a] focus:bg-white focus:ring-4 focus:ring-[#83a36a]/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="mb-2 block text-sm font-bold text-[#35412e]"
                  >
                    Mobile number <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91a087]"
                    />
                    <span className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      +91
                    </span>
                    <input
                      id="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={(event) =>
                        setPhoneNumber(
                          event.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      placeholder="10-digit mobile number"
                      autoComplete="tel-national"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      className="w-full rounded-xl border border-[#e1e6dc] bg-[#fdfefc] py-3.5 pl-[4.5rem] pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#83a36a] focus:bg-white focus:ring-4 focus:ring-[#83a36a]/10"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    We may use this number for delivery updates.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="deliveryAddress"
                    className="mb-2 block text-sm font-bold text-[#35412e]"
                  >
                    Complete delivery address{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(event) =>
                      setDeliveryAddress(event.target.value)
                    }
                    placeholder="House / flat number, street, area, city, state and PIN code"
                    autoComplete="street-address"
                    required
                    minLength={10}
                    maxLength={500}
                    rows={4}
                    className="w-full resize-y rounded-xl border border-[#e1e6dc] bg-[#fdfefc] px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-[#83a36a] focus:bg-white focus:ring-4 focus:ring-[#83a36a]/10"
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Include your PIN code to help ensure accurate delivery.
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className="border-t border-[#edf0e9] px-5 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf3e7] text-[#6e8e54]">
                    <CreditCard size={23} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold sm:text-xl">
                      Payment method
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Choose how you would like to pay.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition sm:p-5 ${
                      paymentMethod === "COD"
                        ? "border-[#7b9b61] bg-[#f5f8f1] ring-2 ring-[#7b9b61]/10"
                        : "border-[#e5e9df] bg-white hover:border-[#bdcdb1]"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#6e8e54] shadow-sm">
                      <ShoppingBag size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#34412d]">
                        Cash on Delivery
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                        Pay when your order arrives.
                      </p>
                    </div>

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        paymentMethod === "COD"
                          ? "border-[#6e8e54] bg-[#6e8e54] text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "COD" && <Check size={13} />}
                    </span>
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 sm:mx-8"
                >
                  <X size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Unable to place order</p>
                    <p className="mt-1">{error}</p>
                    {error.toLowerCase().includes("sign in") && (
                      <button
                        type="button"
                        onClick={() => navigate("/signin")}
                        className="mt-2 font-bold underline"
                      >
                        Sign in again
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-[#edf0e9] bg-[#fcfdfb] p-5 sm:px-8 sm:py-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#6e8e54] px-6 py-4 font-bold text-white shadow-lg shadow-[#6e8e54]/15 transition hover:-translate-y-0.5 hover:bg-[#587442] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Placing your order...
                    </>
                  ) : (
                    <>
                      Place order
                      <ArrowRight size={19} />
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs leading-5 text-gray-500">
                  <LockKeyhole size={14} className="shrink-0" />
                  Your delivery information is sent securely to our server.
                </div>
              </div>
            </form>

            {/* Reassurance strip */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-[#e5e9df] bg-white p-4">
                <ShieldCheck size={22} className="shrink-0 text-[#6e8e54]" />
                <div>
                  <p className="text-xs font-bold">Secure checkout</p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Protected account
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#e5e9df] bg-white p-4">
                <Truck size={22} className="shrink-0 text-[#6e8e54]" />
                <div>
                  <p className="text-xs font-bold">Doorstep delivery</p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Delivered to you
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#e5e9df] bg-white p-4">
                <PackageCheck size={22} className="shrink-0 text-[#6e8e54]" />
                <div>
                  <p className="text-xs font-bold">Freshly packed</p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Carefully prepared
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: order summary */}
          <aside className="lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-2xl border border-[#e5e9df] bg-white shadow-sm shadow-[#25351d]/[0.03]">
              <div className="bg-[#293525] px-6 py-6 text-white sm:px-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c4d4b8]">
                      Your selection
                    </p>
                    <h2 className="mt-2 text-xl font-bold">
                      Order summary
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <ShoppingBag size={23} />
                  </div>
                </div>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-[#e3ebdd]">
                  <span className="h-2 w-2 rounded-full bg-[#b9d79d]" />
                  {itemCount} {itemCount === 1 ? "item" : "items"} in your order
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="space-y-3">
                  {checkoutItems.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex gap-4"
                    >
                      <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl border border-[#e8ebe4] bg-[#f5f6f1]">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#7b965c]">
                            <ShoppingBag size={25} />
                          </div>
                        )}

                        <span className="absolute -right-0.5 -top-0.5 flex h-6 min-w-6 items-center justify-center rounded-bl-lg bg-[#6e8e54] px-1.5 text-[11px] font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 py-1">
                        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#34412d]">
                          {item.productName}
                        </h3>
                        <p className="mt-2 text-xs text-gray-500">
                          {currency(Number(item.unitPrice))} each
                        </p>
                        <p className="mt-2 font-bold text-[#34412d]">
                          {currency(
                            Number(item.unitPrice) * Number(item.quantity)
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="my-6 border-t border-dashed border-[#dfe5d8]" />

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-[#34412d]">
                      {currency(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Truck size={16} />
                      Delivery fee
                    </span>
                    <span className="font-bold text-[#60854a]">
                      Free
                    </span>
                  </div>
                </div>

                <div className="my-6 border-t border-[#e7ebe2]" />

                <div className="rounded-2xl bg-[#f2f6ed] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#34412d]">
                        Total amount
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Inclusive of listed item prices
                      </p>
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight text-[#34412d]">
                      {currency(totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3 rounded-2xl border border-[#e8ebe4] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f6ed] text-[#6e8e54]">
                    <Clock3 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#34412d]">
                      Pay when it arrives
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Your selected payment method is Cash on Delivery.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/shop")}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfe5d8] px-4 py-3 text-sm font-semibold text-[#64745b] transition hover:bg-[#f7f9f4]"
                >
                  <ArrowLeft size={16} />
                  Continue shopping
                </button>
              </div>
            </div>

            <p className="mt-5 text-center text-xs leading-6 text-gray-400">
              By placing your order, you confirm that your delivery
              information is correct.
            </p>
          </aside>
        </div>

        <footer className="mt-12 border-t border-[#e5e9df] py-6 text-center text-xs text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <Leaf size={14} className="text-[#6e8e54]" />
            Farm2Feast · Freshness from farm to your table
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Checkout;