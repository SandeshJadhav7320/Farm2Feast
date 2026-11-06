
import { useState, useEffect, useRef } from "react";
import {
  Send,
  X,
  Sparkles,
  LoaderCircle,
  Bot,
} from "lucide-react";

import { useAIChat } from "../hooks/useAIChat";
import ProductCard from "./ProductCard";
import "./ai-chat.css";

interface AIChatWindowProps {
  onClose: () => void;
}

export default function AIChatWindow({
  onClose,
}: AIChatWindowProps) {

  const {
    messages,
    isLoading,
    error,
    sendMessage,
  } = useAIChat();

  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
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

  return (
    <div className="ai-chat-window fixed bottom-24 right-6 z-50 flex h-[560px] w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-950 shadow-2xl">

      {/* Chat Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 px-4 py-4 text-white">

        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />

        <div className="relative flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-white/20 p-2.5 shadow-inner">
              <Sparkles size={23} />
            </div>

            <div>
              <h3 className="font-bold tracking-wide">
                Farm2Feast Assistant
              </h3>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-300" />

                <p className="text-xs text-green-100">
                  Your AI shopping assistant
                </p>
              </div>
            </div>

          </div>

          <button
            onClick={onClose}
            aria-label="Close chat"
            className="rounded-full p-2 transition hover:rotate-90 hover:bg-white/20"
          >
            <X size={20} />
          </button>

        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-green-50/70 to-gray-50 p-3">

        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="animate-[fadeInUp_0.4s_ease-out_both] rounded-2xl border border-green-100 bg-white p-4 shadow-sm">

            <div className="mb-3 flex items-center gap-2 text-green-700">
              <div className="rounded-xl bg-green-100 p-2">
                <Sparkles size={19} />
              </div>

              <span className="font-bold">
                Welcome to Farm2Feast!
              </span>
            </div>

            <p className="text-sm leading-relaxed text-gray-600">
              Hello! I can help you discover delicious Makhana products,
              check availability, track your orders and answer your
              shopping questions.
            </p>

            <div className="mt-4 rounded-xl bg-green-50 p-3">
              <p className="text-xs font-semibold text-green-800">
                What would you like to explore today?
              </p>

              <p className="mt-1 text-xs text-green-700">
                Try asking: "Show me spicy Makhana products."
              </p>
            </div>

          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (

          <div
            key={message.id}
            className={`flex flex-col ${
              message.role === "user"
                ? "items-end"
                : "items-start"
            }`}
          >

            {/* Message Bubble */}
            <div className="flex max-w-[90%] items-start gap-2">

              {message.role === "assistant" && (
                <div className="mt-1 shrink-0 rounded-full bg-green-100 p-2 text-green-700">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "rounded-br-sm bg-gradient-to-r from-green-700 to-green-600 text-white shadow-md"
                    : "rounded-bl-sm border border-gray-100 bg-white text-gray-800 shadow-sm"
                }`}
              >
                {message.content}
              </div>

            </div>

            {/* Product Cards */}
            {message.role === "assistant" &&
              message.products &&
              message.products.length > 0 && (

                <div className="mt-3 w-full pl-9">

                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={15} className="text-green-700" />

                    <h4 className="text-xs font-bold text-gray-700">
                      Products for you
                    </h4>

                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
                      {message.products.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {message.products.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                      />
                    ))}
                  </div>

                </div>
              )}

          </div>

        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex animate-pulse items-center gap-2 text-sm text-gray-500">

            <div className="rounded-full bg-green-100 p-2 text-green-700">
              <Sparkles size={16} />
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <LoaderCircle
                size={17}
                className="animate-spin text-green-700"
              />

              <span>Assistant is thinking...</span>
            </div>

          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="animate-[fadeInUp_0.3s_ease-out_both] rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* Message Input */}
      <div className="border-t border-gray-100 bg-white p-3">

        <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 transition focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100">

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            disabled={isLoading}
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm transition duration-200 hover:scale-105 hover:bg-green-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={18} />
          </button>

        </div>

        <p className="mt-2 text-center text-[10px] text-gray-400">
          Powered by Farm2Feast AI
        </p>

      </div>

    </div>
  );
}
