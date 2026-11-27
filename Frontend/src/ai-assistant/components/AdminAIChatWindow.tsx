
import { useEffect, useRef, useState } from "react";

import {
  Send,
  X,
  Sparkles,
  LoaderCircle,
  Bot,
  ImagePlus,
  CheckCircle,
  Trash2,
  Pencil,
  Plus,
  Package,
  RefreshCw
} from "lucide-react";

import { useAdminAIChat } from "../hooks/useAdminAIChat";

import type {
  AdminProductDraft,
  AdminProductUpdateDraft
} from "../types/adminAI";

interface AdminAIChatWindowProps {
  onClose: () => void;
}

type OrderRow = Record<string, unknown>;

// ==========================================
// FORMAT ORDER DATE
// ==========================================

function formatOrderDate(value: unknown): string {
  if (!value) return "—";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

// ==========================================
// FORMAT ORDER AMOUNT
// ==========================================

function formatOrderAmount(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return String(value);
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

// ==========================================
// ORDER TABLE COMPONENT
// ==========================================

function OrderTable({
  data,
  type
}: {
  data: unknown;
  type?: string | null;
}) {
  if (!data) return null;

  const orders: OrderRow[] = Array.isArray(data)
    ? data as OrderRow[]
    : typeof data === "object"
      ? [data as OrderRow]
      : [];

  if (orders.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
        No orders found.
      </div>
    );
  }

  return (
    <div className="mt-3 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-3">

        <div>
          <h4 className="font-bold text-gray-800">
            {type === "SINGLE_ORDER"
              ? "Order Details"
              : "Customer Orders"}
          </h4>

          <p className="text-xs text-gray-500">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Package size={19} className="text-green-700" />

      </div>

      <div className="overflow-x-auto">

        <table className="w-full min-w-[650px] border-collapse text-left text-xs">

          <thead className="bg-gray-100 text-gray-600">

            <tr>
              <th className="px-3 py-3 font-semibold">Order ID</th>
              <th className="px-3 py-3 font-semibold">Customer</th>
              <th className="px-3 py-3 font-semibold">Phone</th>
              <th className="px-3 py-3 font-semibold">Total</th>
              <th className="px-3 py-3 font-semibold">Order Status</th>
              <th className="px-3 py-3 font-semibold">Payment</th>
              <th className="px-3 py-3 font-semibold">Date</th>
            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {orders.map((order, index) => (

              <tr
                key={String(order.id ?? index)}
                className="hover:bg-green-50"
              >

                <td className="px-3 py-3 font-semibold text-green-800">
                  #{String(order.id ?? "—")}
                </td>

                <td className="px-3 py-3 text-gray-800">
                  {String(order.deliveryName ?? "—")}
                </td>

                <td className="px-3 py-3 text-gray-600">
                  {String(order.phoneNumber ?? "—")}
                </td>

                <td className="px-3 py-3 font-semibold text-gray-800">
                  {formatOrderAmount(order.totalAmount)}
                </td>

                <td className="px-3 py-3">
                  <span className="inline-block rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-700">
                    {String(order.status ?? "—")}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <span className="inline-block rounded-full bg-green-100 px-2 py-1 font-medium text-green-700">
                    {String(order.paymentStatus ?? "—")}
                  </span>
                </td>

                <td className="px-3 py-3 text-gray-600">
                  {formatOrderDate(order.createdAt)}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="border-t border-gray-100 px-3 py-2 text-[10px] text-gray-400">
        Order data retrieved from Farm2Feast Store backend.
      </div>

    </div>
  );
}

// ==========================================
// MAIN ADMIN AI CHAT WINDOW
// ==========================================

export default function AdminAIChatWindow({
  onClose
}: AdminAIChatWindowProps) {

  const {
    messages,
    conversationId,
    mode,
    draft,
    readyForConfirmation,
    isLoading,
    error,
    sendMessage,
    confirmOperation,
    cancelDraft,
    startNewConversation
  } = useAdminAIChat();

  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addDraft =
    mode === "ADD_PRODUCT"
      ? draft as AdminProductDraft | null
      : null;

  const updateDraft =
    mode === "UPDATE_PRODUCT"
      ? draft as AdminProductUpdateDraft | null
      : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isLoading]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSend = async () => {
    const message = input.trim();

    if (!message || isLoading) {
      return;
    }

    setInput("");

    await sendMessage(message);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // ==========================================
  // IMAGE SELECTION
  // ==========================================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    setImageError("");

    if (!selectedFile) {
      setImage(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setImageError(
        "Please select a JPG, PNG or WEBP image."
      );
      setImage(null);
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setImageError("Image size must be 5 MB or less.");
      setImage(null);
      event.target.value = "";
      return;
    }

    setImage(selectedFile);
  };

  // ==========================================
  // CONFIRM ADD PRODUCT
  // ==========================================

  const handleConfirmAdd = async () => {
    if (!image) {
      setImageError(
        "Please select a product image first."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to add this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await confirmOperation(image);

      setImage(null);
      setImageError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      // The hook displays the error message.
    }
  };

  // ==========================================
  // CONFIRM UPDATE PRODUCT
  // ==========================================

  const handleConfirmUpdate = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to update this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await confirmOperation();
    } catch {
      // The hook displays the error message.
    }
  };

  // ==========================================
  // CANCEL CURRENT OPERATION
  // ==========================================

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this operation?"
    );

    if (!confirmed) {
      return;
    }

    await cancelDraft();

    setImage(null);
    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // START NEW CONVERSATION
  // ==========================================

  const handleNewConversation = () => {
    if (isLoading) {
      return;
    }

    setImage(null);
    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    startNewConversation();
  };

  // ==========================================
  // MODE LABEL
  // ==========================================

  const getModeLabel = () => {
    switch (mode) {
      case "ADD_PRODUCT":
        return "Adding a product";

      case "UPDATE_PRODUCT":
        return "Updating a product";

      case "ORDER":
        return "Order assistant";

      default:
        return "Admin assistant";
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="
      fixed bottom-24 right-6 z-50
      flex h-[620px] w-[390px] max-w-[calc(100vw-32px)]
      flex-col overflow-hidden rounded-2xl
      border border-gray-700 bg-gray-950 shadow-2xl
    ">

      {/* HEADER */}

      <div className="
        relative overflow-hidden
        bg-gradient-to-r from-green-800 via-green-700 to-emerald-600
        px-4 py-4 text-white
      ">

        <div className="relative flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-white/20 p-2.5">
              <Sparkles size={23} />
            </div>

            <div>
              <h3 className="font-bold tracking-wide">
                Farm2Feast Admin AI
              </h3>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-300" />

                <p className="text-xs text-green-100">
                  {getModeLabel()}
                </p>
              </div>
            </div>

          </div>

          <button
            onClick={onClose}
            aria-label="Close chat"
            className="rounded-full p-2 transition hover:bg-white/20"
          >
            <X size={20} />
          </button>

        </div>
      </div>

      {/* CHAT MESSAGES */}

      <div className="
        flex-1 space-y-4 overflow-y-auto
        bg-gradient-to-b from-green-50 to-gray-50 p-3
      ">

        {messages.map(message => (

          <div
            key={message.id}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div className={`flex items-start gap-2 ${
              message.role === "user"
                ? "max-w-[90%]"
                : "w-full min-w-0"
            }`}>

              {message.role === "assistant" && (
                <div className="
                  mt-1 shrink-0 rounded-full
                  bg-green-100 p-2 text-green-700
                ">
                  <Bot size={16} />
                </div>
              )}

              <div className="min-w-0 flex-1">

                <div className={`
                  whitespace-pre-wrap break-words
                  rounded-2xl px-4 py-3 text-sm leading-relaxed
                  ${
                    message.role === "user"
                      ? "rounded-br-sm bg-green-700 text-white"
                      : "rounded-bl-sm border border-gray-100 bg-white text-gray-800 shadow-sm"
                  }
                `}>
                  {message.content}
                </div>

                {/* DISPLAY ORDER TABLE */}

                {message.role === "assistant" &&
                  message.orderData !== undefined &&
                  message.orderData !== null &&
                  (
                    message.orderDataType === "ALL_ORDERS" ||
                    message.orderDataType === "SINGLE_ORDER"
                  ) && (

                    <OrderTable
                      data={message.orderData}
                      type={message.orderDataType}
                    />

                  )}

              </div>

            </div>

          </div>

        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LoaderCircle
              size={18}
              className="animate-spin text-green-700"
            />
            Assistant is thinking...
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* ADD PRODUCT DETAILS */}

      {addDraft && (
        <div className="
          max-h-64 overflow-y-auto border-t
          border-gray-200 bg-white p-3
        ">

          <div className="mb-3 flex items-center gap-2">
            <Plus className="text-green-700" size={19} />

            <h3 className="font-bold text-gray-800">
              New Product Details
            </h3>

            {readyForConfirmation && (
              <CheckCircle
                size={17}
                className="text-green-600"
              />
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-700">

            <p>
              <b>Name:</b>{" "}
              {addDraft.name || "Not provided"}
            </p>

            <p>
              <b>Description:</b>{" "}
              {addDraft.description || "Not provided"}
            </p>

            <p>
              <b>Price:</b>{" "}
              {addDraft.price != null
                ? `₹${addDraft.price}`
                : "Not provided"}
            </p>

            <p>
              <b>Quantity:</b>{" "}
              {addDraft.quantity ?? "Not provided"}
            </p>

            <p>
              <b>Category:</b>{" "}
              {addDraft.category || "Not provided"}
            </p>

          </div>

          {readyForConfirmation && (
            <div className="mt-4">

              <label className="
                mb-2 flex items-center gap-2
                text-sm font-semibold text-gray-700
              ">
                <ImagePlus size={17} />
                Upload product image
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={isLoading}
                className="
                  w-full rounded-lg border border-gray-300
                  bg-gray-50 p-2 text-xs text-gray-700
                "
              />

              {image && (
                <p className="mt-1 text-xs text-green-700">
                  Selected: {image.name}
                </p>
              )}

              {imageError && (
                <p className="mt-1 text-xs text-red-600">
                  {imageError}
                </p>
              )}

              <button
                onClick={handleConfirmAdd}
                disabled={isLoading || !image}
                className="
                  mt-3 flex w-full items-center justify-center gap-2
                  rounded-lg bg-green-700 px-3 py-2
                  text-xs font-semibold text-white
                  hover:bg-green-800
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                <CheckCircle size={15} />

                {isLoading
                  ? "Please wait..."
                  : "Confirm and Add"}
              </button>

            </div>
          )}

        </div>
      )}

      {/* UPDATE PRODUCT DETAILS */}

      {updateDraft && (
        <div className="
          max-h-64 overflow-y-auto border-t
          border-gray-200 bg-white p-3
        ">

          <div className="mb-3 flex items-center gap-2">

            <Pencil className="text-blue-700" size={19} />

            <h3 className="font-bold text-gray-800">
              Product Update Details
            </h3>

            {readyForConfirmation && (
              <CheckCircle
                size={17}
                className="text-green-600"
              />
            )}

          </div>

          <div className="space-y-2 text-sm text-gray-700">

            <p>
              <b>Product ID:</b>{" "}
              {updateDraft.productId ?? "Not provided"}
            </p>

            <p>
              <b>Name:</b>{" "}
              {updateDraft.originalName ?? "—"}
              {" → "}
              {updateDraft.name ?? "—"}
            </p>

            <p>
              <b>Description:</b>{" "}
              {updateDraft.originalDescription ?? "—"}
              {" → "}
              {updateDraft.description ?? "—"}
            </p>

            <p>
              <b>Price:</b>{" "}
              {updateDraft.originalPrice != null
                ? `₹${updateDraft.originalPrice}`
                : "—"}
              {" → "}
              {updateDraft.price != null
                ? `₹${updateDraft.price}`
                : "—"}
            </p>

            <p>
              <b>Quantity:</b>{" "}
              {updateDraft.originalQuantity ?? "—"}
              {" → "}
              {updateDraft.quantity ?? "—"}
            </p>

            <p>
              <b>Category:</b>{" "}
              {updateDraft.originalCategory ?? "—"}
              {" → "}
              {updateDraft.category ?? "—"}
            </p>

          </div>

          {readyForConfirmation && (
            <button
              onClick={handleConfirmUpdate}
              disabled={
                isLoading ||
                !updateDraft.hasChanges
              }
              className="
                mt-4 flex w-full items-center justify-center gap-2
                rounded-lg bg-green-700 px-3 py-2
                text-xs font-semibold text-white
                hover:bg-green-800
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              <CheckCircle size={15} />

              {isLoading
                ? "Updating..."
                : "Confirm Update"}
            </button>
          )}

        </div>
      )}

      {/* ORDER ASSISTANT INFORMATION */}

      {mode === "ORDER" && (
        <div className="
          border-t border-gray-200 bg-white
          px-3 py-2
        ">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Package size={16} className="text-green-700" />

            <span>
              Order information is retrieved from your Store backend.
            </span>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="
          border-t border-red-100 bg-red-50
          px-3 py-2 text-xs text-red-600
        ">
          {error}
        </div>
      )}

      {/* OPERATION BUTTONS */}

      <div className="
        flex gap-2 border-t border-gray-200
        bg-white px-3 pt-2
      ">

        {conversationId &&
          (mode === "ADD_PRODUCT" ||
            mode === "UPDATE_PRODUCT") && (
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="
                flex flex-1 items-center justify-center gap-2
                rounded-lg bg-red-600 px-3 py-2
                text-xs font-semibold text-white
                hover:bg-red-700 disabled:opacity-50
              "
            >
              <Trash2 size={15} />
              Cancel operation
            </button>
          )}

        {conversationId && (
          <button
            onClick={handleNewConversation}
            disabled={isLoading}
            className="
              flex flex-1 items-center justify-center gap-2
              rounded-lg bg-gray-700 px-3 py-2
              text-xs font-semibold text-white
              hover:bg-gray-800 disabled:opacity-50
            "
          >
            <RefreshCw size={14} />
            New chat
          </button>
        )}

      </div>

      {/* MESSAGE INPUT */}

      <div className="border-t border-gray-200 bg-white p-3">

        <div className="
          flex items-end gap-2 rounded-2xl
          border border-gray-200 bg-gray-50 p-1.5
          focus-within:border-green-500
        ">

          <textarea
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to add, update, or view orders..."
            rows={1}
            disabled={isLoading}
            className="
              max-h-24 min-h-10 flex-1 resize-none
              bg-transparent px-3 py-2.5
              text-sm text-gray-800 outline-none
              placeholder:text-gray-400
            "
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="
              flex h-10 w-10 shrink-0 items-center
              justify-center rounded-xl bg-green-700
              text-white hover:bg-green-800
              disabled:cursor-not-allowed disabled:opacity-40
            "
          >
            {isLoading
              ? <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              : <Send size={18} />
            }
          </button>

        </div>

        <p className="mt-2 text-center text-[10px] text-gray-400">
          Powered by Farm2Feast Admin AI
        </p>

      </div>

    </div>
  );
}
