import { useState } from "react";

import { adminAIService } from "../services/adminAIService";

import type {
  AdminChatMessage,
  AdminChatMode,
  AdminProductDraft,
  AdminProductUpdateDraft,
} from "../types/adminAI";

type AdminDraft =
  | AdminProductDraft
  | AdminProductUpdateDraft
  | null;

// Automatically identify the operation from the first message.
function detectChatMode(message: string): AdminChatMode | null {
  const text = message.toLowerCase();

  const updateWords =
    /\b(update|edit|change|modify|replace|correct)\b/;

  const addWords =
    /\b(add|create|insert|new|register)\b/;

  if (updateWords.test(text)) {
    return "update";
  }

  if (addWords.test(text)) {
    return "add";
  }

  return null;
}

export function useAdminAIChat() {
  const [mode, setMode] = useState<AdminChatMode | null>(null);

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] = useState<AdminChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello Admin! 👋 I am your Farm2Feast AI Assistant. You can ask me to add a new product or update an existing product. What would you like me to do?",
    },
  ]);

  const [draft, setDraft] = useState<AdminDraft>(null);

  const [readyForConfirmation, setReadyForConfirmation] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  function addMessage(
    role: "user" | "assistant",
    content: string
  ) {
    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        role,
        content,
      },
    ]);
  }

  async function sendMessage(message: string) {
    if (!message.trim() || isLoading) return;

    setError(null);

    let selectedMode = mode;

    // Detect add/update only for the first message.
    if (!selectedMode) {
      selectedMode = detectChatMode(message);

      if (!selectedMode) {
        addMessage("user", message);

        addMessage(
          "assistant",
          "Would you like me to add a new product or update an existing product? Please mention your action clearly."
        );

        return;
      }

      setMode(selectedMode);
    }

    addMessage("user", message);
    setIsLoading(true);

    try {
      const request = {
        conversationId,
        message,
      };

      if (selectedMode === "add") {
        const response =
          await adminAIService.sendAdminChatMessage(request);

        setConversationId(response.conversationId);
        setDraft(response.draft);
        setReadyForConfirmation(response.readyForConfirmation);

        addMessage("assistant", response.reply);
      } else {
        const response =
          await adminAIService.sendAdminProductUpdateMessage(request);

        setConversationId(response.conversationId);
        setDraft(response.draft);
        setReadyForConfirmation(response.readyForConfirmation);

        addMessage("assistant", response.reply);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(message);
      addMessage("assistant", `Sorry, ${message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmProduct(image?: File | null) {
    if (!conversationId || !mode || isLoading) return;

    if (mode === "add" && !image) {
      setError("Please select a product image before adding the product.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === "add") {
        const result =
          await adminAIService.confirmAdminProduct(
            conversationId,
            image!
          );

        addMessage(
          "assistant",
          result.message || "Product added successfully! 🎉"
        );
      } else {
        const result =
          await adminAIService.confirmAdminProductUpdate(
            conversationId,
            image
          );

        addMessage(
          "assistant",
          `Product updated successfully! 🎉

Product ID: ${result.id}
Product Name: ${result.name}
Price: ${result.price}
Quantity: ${result.quantity}`
        );
      }

      resetConversation();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to complete the operation.";

      setError(message);
      addMessage("assistant", message);
    } finally {
      setIsLoading(false);
    }
  }

  async function cancelDraft() {
    if (!conversationId || !mode || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (mode === "add") {
        await adminAIService.cancelAdminProductDraft(conversationId);
      } else {
        await adminAIService.cancelAdminProductUpdate(conversationId);
      }

      addMessage("assistant", "Your product operation has been cancelled.");

      resetConversation();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to cancel operation.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function resetConversation() {
    setMode(null);
    setConversationId(null);
    setDraft(null);
    setReadyForConfirmation(false);
  }

  function startNewChat() {
    if (isLoading) return;

    setMode(null);
    setConversationId(null);
    setDraft(null);
    setReadyForConfirmation(false);
    setError(null);

    setMessages([
      {
        id: `${Date.now()}`,
        role: "assistant",
        content:
          "Hello Admin! 👋 What would you like me to do? I can help you add a new product or update an existing product.",
      },
    ]);
  }

  return {
    mode,
    conversationId,
    messages,
    draft,
    readyForConfirmation,
    isLoading,
    error,
    sendMessage,
    confirmProduct,
    cancelDraft,
    startNewChat,
  };
}