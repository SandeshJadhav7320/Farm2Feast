
import { useEffect, useRef, useState } from "react";

import {
  Send,
  X,
  Sparkles,
  LoaderCircle,
  Bot,
  Mic,
  MicOff,
  Package,
  ImagePlus,
  CheckCircle,
  Trash2,
} from "lucide-react";

import { useAdminAIChat } from "../hooks/useAdminAIChat";

interface AdminAIChatWindowProps {
  onClose: () => void;
}

export default function AdminAIChatWindow({
  onClose,
}: AdminAIChatWindowProps) {

  const {
    messages,
    draft,
    readyForConfirmation,
    isLoading,
    error,
    sendMessage,
    confirmProduct,
    cancelDraft,
  } = useAdminAIChat();

  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  // Send message
  const handleSend = async () => {

    const message = input.trim();

    if (!message || isLoading) return;

    setInput("");

    await sendMessage(message);
  };

  // Select product image
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Please select a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  };

  // Confirm product
  const handleConfirm = async () => {

    if (!image) {
      alert("Please upload the product image.");
      return;
    }

    if (!window.confirm(
      "Are you sure you want to add this product?"
    )) {
      return;
    }

    await confirmProduct(image);

    setImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview("");
    }
  };

  // Cancel product
  const handleCancel = async () => {

    if (!window.confirm(
      "Are you sure you want to cancel this product?"
    )) {
      return;
    }

    await cancelDraft();

    setImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview("");
    }
  };

  // Voice recognition
  const handleVoiceInput = () => {

    setVoiceError("");

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        "Voice recognition is not supported. Please use Chrome."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {

      const transcript =
        event.results[0][0].transcript;

      setInput((previous) =>
        previous.trim()
          ? `${previous.trim()} ${transcript}`
          : transcript
      );
    };

    recognition.onerror = (event: any) => {

      setVoiceError(
        event.error === "not-allowed"
          ? "Please allow microphone permission."
          : `Voice error: ${event.error}`
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="
        fixed bottom-24 right-6 z-50
        flex h-[620px] w-[390px]
        max-h-[calc(100vh-120px)]
        max-w-[calc(100vw-32px)]
        flex-col overflow-hidden
        rounded-2xl border border-gray-700
        bg-gray-950 shadow-2xl
      "
    >

      {/* Header */}
      <div className="
        relative overflow-hidden
        bg-gradient-to-r from-green-900
        via-green-800 to-emerald-600
        px-4 py-4 text-white
      ">

        <div className="relative flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-white/20 p-2.5">
              <Sparkles size={23} />
            </div>

            <div>
              <h3 className="font-bold">
                Farm2Feast Admin AI
              </h3>

              <p className="mt-1 text-xs text-green-100">
                Your AI product management assistant
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            aria-label="Close Admin AI"
            className="rounded-full p-2 hover:bg-white/20"
          >
            <X size={20} />
          </button>

        </div>
      </div>

      {/* Messages */}
      <div className="
        flex-1 space-y-4 overflow-y-auto
        bg-gradient-to-b from-gray-900 to-gray-950
        p-3
      ">

        {messages.map((message) => (

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
                  bg-green-100 p-2 text-green-800
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
                    : "rounded-bl-sm bg-gray-800 text-gray-100"
                }
              `}>
                {message.content}
              </div>

            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-300">

            <Sparkles size={17} />

            <LoaderCircle
              size={17}
              className="animate-spin"
            />

            <span>Admin AI is thinking...</span>
          </div>
        )}

        {error && (
          <div className="
            rounded-xl border border-red-800
            bg-red-950 p-3 text-sm text-red-300
          ">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Product Draft */}
      {draft && (
        <div className="
          max-h-64 overflow-y-auto
          border-t border-gray-700
          bg-gray-900 p-3 text-white
        ">

          <div className="mb-3 flex items-center gap-2">

            <Package className="text-green-400" size={20} />

            <h3 className="font-bold">
              Product Details
            </h3>

            {readyForConfirmation && (
              <CheckCircle
                size={18}
                className="ml-auto text-green-400"
              />
            )}
          </div>

          <div className="space-y-2 text-sm">

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
            <div className="mt-4 space-y-3">

              <label className="
                flex cursor-pointer items-center
                justify-center gap-2 rounded-xl
                border border-dashed border-green-500
                bg-gray-800 p-3 text-sm text-green-300
              ">

                <ImagePlus size={20} />

                {image
                  ? image.name
                  : "Choose Product Image"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />

              </label>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="
                    h-28 w-full rounded-xl
                    object-contain bg-gray-800
                  "
                />
              )}

              <div className="flex gap-2">

                <button
                  onClick={handleConfirm}
                  disabled={!image || isLoading}
                  className="
                    flex flex-1 items-center
                    justify-center gap-2 rounded-lg
                    bg-green-700 px-3 py-2
                    text-sm font-semibold text-white
                    hover:bg-green-800
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <CheckCircle size={17} />
                  Confirm Product
                </button>

                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="
                    flex items-center gap-1 rounded-lg
                    bg-red-700 px-3 py-2
                    text-sm text-white hover:bg-red-800
                    disabled:opacity-40
                  "
                >
                  <Trash2 size={16} />
                  Cancel
                </button>

              </div>

            </div>
          )}
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-700 bg-gray-900 p-3">

        <div className="
          flex items-end gap-2 rounded-2xl
          border border-gray-700 bg-gray-800 p-1.5
          focus-within:border-green-500
        ">

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me which product to add..."
            rows={1}
            disabled={isLoading}
            className="
              max-h-24 min-h-10 flex-1 resize-none
              bg-transparent px-3 py-2.5
              text-sm text-white outline-none
              placeholder:text-gray-400
            "
          />

          {/* Microphone */}
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isLoading}
            title="Voice input"
            className={`
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl text-white
              ${
                isListening
                  ? "bg-red-600"
                  : "bg-green-700 hover:bg-green-800"
              }
            `}
          >
            {isListening ? (
              <MicOff size={19} />
            ) : (
              <Mic size={19} />
            )}
          </button>

          {/* Send */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl bg-green-700
              text-white hover:bg-green-800
              disabled:opacity-40
            "
          >
            <Send size={18} />
          </button>

        </div>

        {isListening && (
          <p className="mt-2 text-center text-xs text-green-400">
            Listening... Speak in English
          </p>
        )}

        {voiceError && (
          <p className="mt-2 text-center text-xs text-red-400">
            {voiceError}
          </p>
        )}

        <p className="mt-2 text-center text-[10px] text-gray-500">
          Powered by Farm2Feast Admin AI
        </p>

      </div>
    </div>
  );
}
