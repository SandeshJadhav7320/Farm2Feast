import { useRef, useState } from "react";

import { useAdminAIChat } from "../hooks/useAdminAIChat";

import type {
  AdminProductDraft,
  AdminProductUpdateDraft,
} from "../types/adminAI";

interface Props {
  onClose: () => void;
}

type AdminDraft =
  | AdminProductDraft
  | AdminProductUpdateDraft
  | null;

export default function AdminAIChatWindow({ onClose }: Props) {
  const {
    mode,
    messages,
    draft,
    readyForConfirmation,
    isLoading,
    error,
    sendMessage,
    confirmProduct,
    cancelDraft,
    startNewChat,
  } = useAdminAIChat();

  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  function handleSend() {
    if (!input.trim() || isLoading) return;

    sendMessage(input);
    setInput("");

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  async function handleConfirm() {
    await confirmProduct(image);
    setImage(null);
  }

  async function handleCancel() {
    await cancelDraft();
    setImage(null);
  }

  const isUpdateDraft =
    draft !== null && "productId" in draft;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex h-[620px] w-[390px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-950 text-white shadow-2xl">

      {/* HEADER */}
      <div className="flex items-center justify-between bg-green-700 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-green-700">
            🤖
          </div>

          <div>
            <h2 className="font-semibold">
              Farm2Feast AI
            </h2>

            <p className="text-xs text-green-100">
              Admin Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={startNewChat}
            disabled={isLoading}
            title="New chat"
            className="text-xl text-white hover:text-green-200 disabled:opacity-50"
          >
            +
          </button>

          <button
            onClick={onClose}
            className="text-2xl text-white hover:text-green-200"
          >
            ×
          </button>
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-900 p-4">

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                message.role === "user"
                  ? "rounded-br-sm bg-green-700 text-white"
                  : "rounded-bl-sm bg-gray-800 text-gray-100"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-800 px-4 py-3 text-sm text-gray-300">
              AI is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* PRODUCT DRAFT */}
      {draft && (
        <div className="max-h-64 overflow-y-auto border-t border-gray-700 bg-gray-800 p-4">

          <h3 className="mb-3 font-semibold text-green-400">
            {isUpdateDraft
              ? "Product Update Preview"
              : "New Product Preview"}
          </h3>

          {isUpdateDraft ? (
            <UpdateDraftPreview draft={draft as AdminProductUpdateDraft} />
          ) : (
            <AddDraftPreview draft={draft as AdminProductDraft} />
          )}

          {/* IMAGE UPLOAD */}
          <div className="mt-3">
            <label className="mb-1 block text-xs text-gray-300">
              Product Image{" "}
              {mode === "add" ? "(Required)" : "(Optional)"}
            </label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) =>
                setImage(event.target.files?.[0] || null)
              }
              className="w-full text-xs text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-green-700 file:px-3 file:py-2 file:text-white"
            />
          </div>

          {readyForConfirmation && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={isLoading || (mode === "add" && !image)}
                className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading
                  ? "Processing..."
                  : isUpdateDraft
                    ? "Confirm and Update"
                    : "Confirm and Add"}
              </button>

              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="border-t border-red-800 bg-red-950 px-4 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* MESSAGE INPUT */}
      <div className="flex items-end gap-2 border-t border-gray-700 bg-gray-950 p-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your admin assistant..."
          rows={1}
          disabled={isLoading}
          className="max-h-24 min-h-11 flex-1 resize-none rounded-xl border border-gray-700 bg-gray-800 px-3 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-green-500 disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="h-11 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function AddDraftPreview({
  draft,
}: {
  draft: AdminProductDraft;
}) {
  return (
    <div className="space-y-1 text-xs text-gray-200">
      <p><strong>Name:</strong> {draft.name}</p>
      <p><strong>Description:</strong> {draft.description}</p>
      <p><strong>Price:</strong> ₹{draft.price}</p>
      <p><strong>Quantity:</strong> {draft.quantity}</p>
      <p><strong>Category:</strong> {draft.category || "Not specified"}</p>
    </div>
  );
}

function UpdateDraftPreview({
  draft,
}: {
  draft: AdminProductUpdateDraft;
}) {
  return (
    <div className="space-y-1 text-xs text-gray-200">
      <p><strong>Product ID:</strong> {draft.productId}</p>
      <p><strong>Name:</strong> {draft.name}</p>
      <p><strong>Description:</strong> {draft.description}</p>
      <p><strong>Price:</strong> ₹{draft.price}</p>
      <p><strong>Quantity:</strong> {draft.quantity}</p>
      <p><strong>Category:</strong> {draft.category}</p>

      {!draft.hasChanges && (
        <p className="pt-2 text-yellow-400">
          No changes have been made yet.
        </p>
      )}
    </div>
  );
}