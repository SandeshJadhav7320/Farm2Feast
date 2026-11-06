
import { useRef, useState } from "react";
import { sendChatMessage } from "../services/aiService";
import type { ChatMessage } from "../types/chat";

export function useAIChat() {
  const [conversationId, setConversationId] = useState(
    () => crypto.randomUUID()
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestInProgress = useRef(false);

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((previous) => [...previous, userMessage]);

    try {
      const data = await sendChatMessage({
        conversationId,
        message: trimmedMessage,
      });

      if (!data.response?.trim()) {
        throw new Error("The AI assistant returned an empty response.");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        products: data.products ?? [],
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(errorMessage);

    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    if (requestInProgress.current) {
      return;
    }

    setMessages([]);
    setError(null);
    setConversationId(crypto.randomUUID());
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
  };
}
