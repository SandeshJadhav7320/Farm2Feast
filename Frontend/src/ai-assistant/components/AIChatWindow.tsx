
import { useState, useEffect, useRef } from "react";
import { Send, X, Sparkles, LoaderCircle } from "lucide-react";

import { useAIChat } from "../hooks/useAIChat";

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

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Handle sending a message
  const handleSend = async () => {
    const message = input.trim();

    if (!message || isLoading) return;

    setInput("");

    await sendMessage(message);
  };

  // Send message when Enter is pressed
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
      className="fixed bottom-24 right-6 z-50
                 flex h-[520px] w-[360px]
                 max-w-[calc(100vw-32px)]
                 flex-col overflow-hidden
                 rounded-2xl bg-white shadow-2xl
                 border border-gray-200"
    >

      {/* Chat Header */}
      <div className="flex items-center justify-between
                      bg-green-700 px-4 py-4 text-white">

        <div className="flex items-center gap-3">

          <div className="rounded-full bg-white/20 p-2">
            <Sparkles size={22} />
          </div>

          <div>
            <h3 className="font-semibold">
              Farm2Feast Assistant
            </h3>

            <p className="text-xs text-green-100">
              Your AI shopping assistant
            </p>
          </div>

        </div>

        <button
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-full p-2 hover:bg-white/20"
        >
          <X size={20} />
        </button>

      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto
                      space-y-4 bg-gray-50 p-4">

        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="rounded-xl bg-white p-4 shadow-sm">

            <div className="mb-2 flex items-center gap-2
                            text-green-700">
              <Sparkles size={18} />

              <span className="font-semibold">
                Welcome to Farm2Feast!
              </span>
            </div>

            <p className="text-sm text-gray-600">
              Hello! I can help you find products,
              check your orders, and answer your
              shopping questions.
            </p>

            <p className="mt-3 text-xs text-gray-400">
              What would you like to know today?
            </p>

          </div>
        )}

        {/* Display Messages */}
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
              className={`max-w-[85%] whitespace-pre-wrap
                          break-words rounded-2xl px-4 py-3
                          text-sm ${
                message.role === "user"
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-800 shadow-sm"
              }`}
            >
              {message.content}
            </div>

          </div>

        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2
                          text-sm text-gray-500">

            <LoaderCircle
              size={18}
              className="animate-spin"
            />

            <span>Assistant is thinking...</span>

          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3
                          text-sm text-red-600">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200
                      bg-white p-3">

        <div className="flex items-end gap-2">

          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            disabled={isLoading}
            className="max-h-28 min-h-11 flex-1
                       resize-none rounded-xl
                       border border-gray-300
                       px-3 py-3 text-sm
                       outline-none
                       focus:border-green-600
                       disabled:bg-gray-100"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0
                       items-center justify-center
                       rounded-xl bg-green-700
                       text-white transition
                       hover:bg-green-800
                       disabled:cursor-not-allowed
                       disabled:opacity-50"
          >
            <Send size={19} />
          </button>

        </div>

        <p className="mt-2 text-center text-[10px]
                      text-gray-400">
          Powered by Farm2Feast AI
        </p>

      </div>

    </div>
  );
}
