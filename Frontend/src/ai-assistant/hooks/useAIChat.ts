
import { useState } from "react";
import { sendChatMessage } from "../services/aiService";
import type { ChatMessage } from "../types/chat";

export function useAIChat() {

  // Unique ID for the current conversation
  const [conversationId, setConversationId] = useState(
    () => crypto.randomUUID()
  );

  // Stores all messages displayed in the chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Tracks whether the AI is generating a response
  const [isLoading, setIsLoading] = useState(false);

  // Stores error messages
  const [error, setError] = useState<string | null>(null);

  // Send a message to the AI
  const sendMessage = async (message: string) => {

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    setError(null);

    // Create the customer's message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    // Display the customer's message immediately
    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setIsLoading(true);

    try {

      // Call Spring Boot API
      const data = await sendChatMessage({
        conversationId,
        message: trimmedMessage,
      });

      // Create the AI response message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
      };

      // Display the AI response
      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);

    } catch (err) {

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(errorMessage);

    } finally {

      // Stop loading whether the request succeeds or fails
      setIsLoading(false);
    }
  };

  // Start a completely new conversation
  const resetChat = () => {
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
