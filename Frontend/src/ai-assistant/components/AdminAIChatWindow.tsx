
import { useEffect, useRef, useState } from "react";

import {
  Send,
  X,
  Sparkles,
  LoaderCircle,
  Bot,
  Package,
  ImagePlus,
  CheckCircle,
  Trash2,
  Pencil,
  Plus
} from "lucide-react";

import { useAdminAIChat } from "../hooks/useAdminAIChat";

import type {
  AdminProductDraft,
  AdminProductUpdateDraft
} from "../types/adminAI";

interface AdminAIChatWindowProps {
  onClose: () => void;
}

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
  confirmProduct,
  confirmProductUpdate,
  cancelDraft
} = useAdminAIChat();

  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addDraft =
    mode === "add"
      ? draft as AdminProductDraft | null
      : null;

  const updateDraft =
    mode === "update"
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
  // IMAGE SELECTION FOR ADD PRODUCT
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
      setImageError("Please select a JPG, PNG or WEBP image.");
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
      setImageError("Please select a product image first.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to add this product?"
    );

    if (!confirmed) {
      return;
    }

    try {

      await confirmProduct(image);

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
      await confirmProductUpdate();
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
                  {mode === "add"
                    ? "Adding a product"
                    : mode === "update"
                      ? "Updating a product"
                      : "Product management assistant"}
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

            <div className="flex max-w-[90%] items-start gap-2">

              {message.role === "assistant" && (
                <div className="
                  mt-1 shrink-0 rounded-full
                  bg-green-100 p-2 text-green-700
                ">
                  <Bot size={16} />
                </div>
              )}

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
              <CheckCircle size={17} className="text-green-600" />
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-700">

            <p>
              <b>Name:</b> {addDraft.name || "Not provided"}
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
                {isLoading ? "Please wait..." : "Confirm and Add"}
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
              <CheckCircle size={17} className="text-green-600" />
            )}

          </div>

          <div className="space-y-2 text-sm text-gray-700">

            <p>
              <b>Product ID:</b> {updateDraft.productId}
            </p>

            <p>
              <b>Name:</b>{" "}
              {updateDraft.originalName} → {updateDraft.name}
            </p>

            <p>
              <b>Description:</b>{" "}
              {updateDraft.originalDescription} → {updateDraft.description}
            </p>

            <p>
              <b>Price:</b>{" "}
              ₹{updateDraft.originalPrice} → ₹{updateDraft.price}
            </p>

            <p>
              <b>Quantity:</b>{" "}
              {updateDraft.originalQuantity} → {updateDraft.quantity}
            </p>

            <p>
              <b>Category:</b>{" "}
              {updateDraft.originalCategory} → {updateDraft.category}
            </p>

          </div>

          {readyForConfirmation && (
            <button
              onClick={handleConfirmUpdate}
              disabled={isLoading || !updateDraft.hasChanges}
              className="
                mt-4 flex w-full items-center justify-center gap-2
                rounded-lg bg-green-700 px-3 py-2
                text-xs font-semibold text-white
                hover:bg-green-800
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              <CheckCircle size={15} />
              {isLoading ? "Updating..." : "Confirm Update"}
            </button>
          )}

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

      {/* CANCEL BUTTON */}

      {conversationId && mode && (
        <div className="border-t border-gray-200 bg-white px-3 pt-2">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="
              flex w-full items-center justify-center gap-2
              rounded-lg bg-red-600 px-3 py-2
              text-xs font-semibold text-white
              hover:bg-red-700 disabled:opacity-50
            "
          >
            <Trash2 size={15} />
            Cancel current operation
          </button>
        </div>
      )}

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
            placeholder="Ask me to add or update a product..."
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
              ? <LoaderCircle size={18} className="animate-spin" />
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
