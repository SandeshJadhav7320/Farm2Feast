
import { useRef, useState } from "react";

import {
  sendAdminAssistantMessage,
  confirmAdminAssistantOperation,
  cancelAdminAssistantOperation
} from "../services/adminAIService";

import type {
  AdminChatMessage,
  AdminProductDraft,
  AdminProductUpdateDraft,
  AdminChatMode
} from "../types/adminAI";

type AdminDraft =
  | AdminProductDraft
  | AdminProductUpdateDraft
  | null;

export function useAdminAIChat() {
  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [mode, setMode] =
    useState<AdminChatMode>(null);

  const [messages, setMessages] =
    useState<AdminChatMessage[]>([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Hello Admin! Welcome to Farm2Feast AI. I can help you add products, update existing products, and view orders. What would you like to do?"
      }
    ]);

  const [draft, setDraft] = useState<AdminDraft>(null);

  const [readyForConfirmation, setReadyForConfirmation] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const requestInProgress = useRef(false);

  const addAssistantMessage = (content: string) => {
    setMessages(previous => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content
      }
    ]);
  };

  const resetOperation = () => {
    setConversationId(null);
    setMode(null);
    setDraft(null);
    setReadyForConfirmation(false);
  };

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    setMessages(previous => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedMessage
      }
    ]);

    try {
      const response = await sendAdminAssistantMessage({
        conversationId,
        message: trimmedMessage
      });

      setConversationId(response.conversationId);
      setMode(
        response.operation === "UNKNOWN"
          ? null
          : response.operation
      );

      setDraft(response.draft ?? null);
      setReadyForConfirmation(
        response.readyForConfirmation
      );

      addAssistantMessage(response.reply);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(errorMessage);
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  // ==========================================
  // CONFIRM ADD OR UPDATE PRODUCT
  // ==========================================

  const confirmOperation = async (image?: File | null) => {
    if (
      !conversationId ||
      !readyForConfirmation ||
      (mode !== "ADD_PRODUCT" && mode !== "UPDATE_PRODUCT")
    ) {
      throw new Error(
        "There is no product operation ready for confirmation."
      );
    }

    if (mode === "ADD_PRODUCT" && !image) {
      throw new Error(
        "Please select a product image before adding the product."
      );
    }

    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await confirmAdminAssistantOperation(
        conversationId,
        image
      );

      let successMessage = response.message || "Operation completed successfully.";

      if (mode === "ADD_PRODUCT") {
        const productName =
          response.product?.name ||
          (draft as AdminProductDraft | null)?.name ||
          "Product";

        successMessage =
          `${successMessage} ${productName} has been added successfully.`;
      } else {
        const productName =
          response.name ||
          (draft as AdminProductUpdateDraft | null)?.name ||
          "Product";

        successMessage =
          `${successMessage} Product "${productName}" has been updated successfully.`;
      }

      addAssistantMessage(successMessage);
      resetOperation();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to confirm this operation.";

      setError(errorMessage);
      throw err;
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  // ==========================================
  // CANCEL CURRENT OPERATION
  // ==========================================

  const cancelDraft = async () => {
    if (!conversationId || requestInProgress.current) {
      return;
    }

    if (mode === "ORDER" || mode === null) {
      // There is no product draft to cancel in these cases.
      resetOperation();
      addAssistantMessage(
        "Your conversation has been reset. You can start a new request."
      );
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await cancelAdminAssistantOperation(conversationId);

      addAssistantMessage(
        "Your current operation has been cancelled. You can start a new request."
      );

      resetOperation();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to cancel the operation.";

      setError(errorMessage);
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  // Start a completely new conversation.
  const startNewConversation = () => {
    if (requestInProgress.current) {
      return;
    }

    resetOperation();

    setMessages(previous => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "New conversation started. What would you like me to do?"
      }
    ]);

    setError(null);
  };

  return {
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
  };
}
