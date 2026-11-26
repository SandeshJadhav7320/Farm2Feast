
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
  Plus,
  Pencil
} from "lucide-react";

import { useAdminAIChat } from "../hooks/useAdminAIChat";

interface AdminAIChatWindowProps {
  onClose: () => void;
}

export default function AdminAIChatWindow({
  onClose
}: AdminAIChatWindowProps) {

  const {
    mode,
    selectMode,
    messages,
    conversationId,
    draft,
    readyForConfirmation,
    isLoading,
    error,
    sendMessage,
    confirmProduct,
    cancelDraft
  } = useAdminAIChat();

  const [input, setInput] = useState("");

  const [image, setImage] = useState<File | null>(null);

  const [imageError, setImageError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isLoading]);

  const handleSend = async () => {

    const message = input.trim();

    if (!message || isLoading) return;

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

  const handleConfirm = async () => {

    if (mode === "add" && !image) {
      setImageError("Please select a product image first.");
      return;
    }

    const confirmed = window.confirm(
      mode === "add"
        ? "Are you sure you want to add this product?"
        : "Are you sure you want to update this product?"
    );

    if (!confirmed) return;

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

  const handleCancel = async () => {

    const confirmed = window.confirm(
      mode === "add"
        ? "Are you sure you want to cancel this product draft?"
        : "Are you sure you want to cancel this product update?"
    );

    if (!confirmed) return;

    await cancelDraft();

    setImage(null);
    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleModeChange = (newMode: "add" | "update") => {

    selectMode(newMode);

    setImage(null);
    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="
      fixed bottom-24 right-6 z-50
      flex h-[680px] w-[390px] max-w-[calc(100vw-32px)]
      flex-col overflow-hidden rounded-2xl
      border border-gray-700 bg-gray-950 shadow-2xl
    ">

      {/* Header */}
      <div className="
        relative overflow-hidden
        bg-gradient-to-r from-green-800 via-green-700 to-emerald-600
        px-4 py-4 text-white
      ">

        <div className="flex items-center justify-between">

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
                  Product management assistant
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

      {/* Add / Update selector */}
      <div className="flex gap-2 border-b border-gray-700 bg-gray-900 p-3">

        <button
          onClick={() => handleModeChange("add")}
          disabled={isLoading || !!conversationId}
          className={`
            flex flex-1 items-center justify-center gap-2
            rounded-lg px-3 py-2 text-sm font-semibold transition
            disabled:cursor-not-allowed disabled:opacity-50
            ${
              mode === "add"
                ? "bg-green-700 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }
          `}
        >
          <Plus size={16} />
          Add Product
        </button>

        <button
          onClick={() => handleModeChange("update")}
          disabled={isLoading || !!conversationId}
          className={`
            flex flex-1 items-center justify-center gap-2
            rounded-lg px-3 py-2 text-sm font-semibold transition
            disabled:cursor-not-allowed disabled:opacity-50
            ${
              mode === "update"
                ? "bg-green-700 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }
          `}
        >
          <Pencil size={16} />
          Update Product
        </button>

      </div>

      {/* Messages */}
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

      {/* Product details and confirmation */}
      {draft && (

        <div className="
          max-h-72 overflow-y-auto border-t
          border-gray-200 bg-white p-3
        ">

          <div className="mb-3 flex items-center gap-2">

            <Package className="text-green-700" size={19} />

            <h3 className="font-bold text-gray-800">
              {mode === "add"
                ? "New Product Details"
                : "Product Update Details"}
            </h3>

            {readyForConfirmation && (
              <CheckCircle
                size={17}
                className="text-green-600"
              />
            )}

          </div>

          <div className="space-y-2 text-sm text-gray-700">

            {mode === "update" && "productId" in draft && (
              <p>
                <b>Product ID:</b> {draft.productId ?? "Not selected"}
              </p>
            )}

            <p>
              <b>Name:</b> {draft.name || "Not provided"}
            </p>

            <p>
              <b>Description:</b>{" "}
              {draft.description || "Not provided"}
            </p>

            <p>
              <b>Price:</b>{" "}
              {draft.price != null
                ? `₹${draft.price}`
                : "Not provided"}
            </p>

            <p>
              <b>Quantity:</b>{" "}
              {draft.quantity ?? "Not provided"}
            </p>

            <p>
              <b>Category:</b>{" "}
              {draft.category || "Not provided"}
            </p>

          </div>

          {readyForConfirmation && (

            <div className="mt-4">

              <label className="
                mb-2 flex items-center gap-2
                text-sm font-semibold text-gray-700
              ">

                <ImagePlus size={17} />

                {mode === "add"
                  ? "Upload product image (required)"
                  : "Replace product image (optional)"}

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

              <div className="mt-3 flex gap-2">

                <button
                  onClick={handleConfirm}
                  disabled={
                    isLoading ||
                    (mode === "add" && !image)
                  }
                  className="
                    flex flex-1 items-center justify-center gap-2
                    rounded-lg bg-green-700 px-3 py-2
                    text-xs font-semibold text-white
                    hover:bg-green-800
                    disabled:cursor-not-allowed disabled:opacity-50
                  "
                >

                  <CheckCircle size={15} />

                  {isLoading
                    ? "Please wait..."
                    : mode === "add"
                      ? "Confirm and Add"
                      : "Confirm and Update"}

                </button>

                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="
                    flex items-center justify-center gap-2
                    rounded-lg bg-red-600 px-3 py-2
                    text-xs font-semibold text-white
                    hover:bg-red-700
                    disabled:opacity-50
                  "
                >

                  <Trash2 size={15} />

                  Cancel

                </button>

              </div>

            </div>

          )}

        </div>

      )}

      {/* Error */}
      {error && (
        <div className="
          border-t border-red-100 bg-red-50
          px-3 py-2 text-xs text-red-600
        ">
          {error}
        </div>
      )}

      {/* Message input */}
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
            placeholder={
              mode === "add"
                ? "Tell me about the new product..."
                : "Tell me which product to update..."
            }
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
