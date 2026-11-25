
import { useRef, useState } from "react";

import {
  sendAdminChatMessage,
  confirmAdminProduct,
  cancelAdminProductDraft,
} from "../services/adminAIService";

import type {
  AdminChatMessage,
  AdminProductDraft,
} from "../types/adminAI";

export function useAdminAIChat() {

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<AdminChatMessage[]>([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Hello Admin! I can help you add products. Tell me which product you want to add.",
      },
    ]);

  const [draft, setDraft] =
    useState<AdminProductDraft | null>(null);

  const [readyForConfirmation, setReadyForConfirmation] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [createdProduct, setCreatedProduct] = useState<string | null>(
    null
  );

  const requestInProgress = useRef(false);

  // Send message to AI
  const sendMessage = async (message: string) => {

    const trimmedMessage = message.trim();

    if (!trimmedMessage || requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);
    setCreatedProduct(null);

    const userMessage: AdminChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((previous) => [...previous, userMessage]);

    try {

      const data = await sendAdminChatMessage({
        conversationId,
        message: trimmedMessage,
      });

      setConversationId(data.conversationId);
      setDraft(data.draft);
      setReadyForConfirmation(data.readyForConfirmation);

      const assistantMessage: AdminChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

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

  // Confirm and create product
  const confirmProduct = async (image: File) => {

    if (!conversationId || requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {

      const data = await confirmAdminProduct(
        conversationId,
        image
      );

      const productName =
        data.product?.name || "Product";

      setCreatedProduct(
        `${productName} added successfully!`
      );

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            `Successfully added ${productName}!`,
        },
      ]);

      // Reset draft after successful creation
      setConversationId(null);
      setDraft(null);
      setReadyForConfirmation(false);

    } catch (err) {

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Product creation failed.";

      setError(errorMessage);

    } finally {

      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  // Cancel draft
  const cancelDraft = async () => {

    if (!conversationId || requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {

      await cancelAdminProductDraft(conversationId);

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Product creation cancelled.",
        },
      ]);

      setConversationId(null);
      setDraft(null);
      setReadyForConfirmation(false);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel the draft."
      );

    } finally {

      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  return {
    messages,
    draft,
    conversationId,
    readyForConfirmation,
    isLoading,
    error,
    createdProduct,
    sendMessage,
    confirmProduct,
    cancelDraft,
  };
}
