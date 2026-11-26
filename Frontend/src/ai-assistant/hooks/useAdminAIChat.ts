
import { useRef, useState } from "react";

import {
  sendAdminChatMessage,
  confirmAdminProduct,
  cancelAdminProductDraft
} from "../services/adminAiService";

import type {
  AdminChatMessage,
  AdminProductDraft
} from "../types/adminAi";

export function useAdminAIChat() {

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<AdminChatMessage[]>([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Hello Admin! I can help you add products. Tell me which product you want to add."
      }
    ]);

  const [draft, setDraft] =
    useState<AdminProductDraft | null>(null);

  const [readyForConfirmation, setReadyForConfirmation] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const requestInProgress = useRef(false);

  // Send a message to AI
  const sendMessage = async (message: string) => {

    const trimmedMessage = message.trim();

    if (!trimmedMessage || requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    const userMessage: AdminChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage
    };

    setMessages(previous => [...previous, userMessage]);

    try {

      const response = await sendAdminChatMessage({
        conversationId,
        message: trimmedMessage
      });

      setConversationId(response.conversationId);
      setDraft(response.draft);
      setReadyForConfirmation(response.readyForConfirmation);

      const assistantMessage: AdminChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply
      };

      setMessages(previous => [...previous, assistantMessage]);

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

  // Confirm product creation
  const confirmProduct = async (image: File) => {

    if (!conversationId || !readyForConfirmation) {
      throw new Error("Please complete the product details first.");
    }

    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {

      const response = await confirmAdminProduct(
        conversationId,
        image
      );

      const productName =
        response.product?.name || draft?.name || "Product";

      setMessages(previous => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            `${response.message} ${productName} has been added successfully.`
        }
      ]);

      setConversationId(null);
      setDraft(null);
      setReadyForConfirmation(false);

    } catch (err) {

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Product creation failed.";

      setError(errorMessage);
      throw err;

    } finally {

      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  // Cancel current product draft
  const cancelDraft = async () => {

    if (!conversationId || requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {

      await cancelAdminProductDraft(conversationId);

      setMessages(previous => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Your product draft has been cancelled. You can start again."
        }
      ]);

      setConversationId(null);
      setDraft(null);
      setReadyForConfirmation(false);

    } catch (err) {

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to cancel draft.";

      setError(errorMessage);

    } finally {

      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  return {
    messages,
    conversationId,
    draft,
    readyForConfirmation,
    isLoading,
    error,
    sendMessage,
    confirmProduct,
    cancelDraft
  };
}
