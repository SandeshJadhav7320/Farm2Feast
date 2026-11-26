
import { useRef, useState } from "react";

import {
  sendAdminChatMessage,
  confirmAdminProduct,
  cancelAdminProductDraft,
  sendAdminProductUpdateMessage,
  confirmAdminProductUpdate,
  cancelAdminProductUpdate
} from "../services/adminAIService";

import type {
  AdminChatMessage,
  AdminChatMode,
  AdminProductDraft,
  AdminProductUpdateDraft
} from "../types/adminAI";

type CurrentDraft =
  | AdminProductDraft
  | AdminProductUpdateDraft
  | null;

export function useAdminAIChat() {

  const [mode, setMode] = useState<AdminChatMode>("add");

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] = useState<AdminChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Hello Admin! I can help you add products. Tell me which product you want to add."
    }
  ]);

  const [draft, setDraft] = useState<CurrentDraft>(null);

  const [readyForConfirmation, setReadyForConfirmation] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const requestInProgress = useRef(false);

  // Change between Add Product and Update Product.
  // Mode can only be changed before a conversation starts.
  const selectMode = (newMode: AdminChatMode) => {

    if (conversationId || requestInProgress.current) {
      return;
    }

    setMode(newMode);
    setDraft(null);
    setReadyForConfirmation(false);
    setError(null);

    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          newMode === "add"
            ? "Hello Admin! I can help you add products. Tell me which product you want to add."
            : "Hello Admin! I can help you update an existing product. Please tell me the product ID you want to update."
      }
    ]);
  };

  // Send a message to the selected AI.
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

      if (mode === "add") {

        const response = await sendAdminChatMessage({
          conversationId,
          message: trimmedMessage
        });

        setConversationId(response.conversationId);
        setDraft(response.draft);
        setReadyForConfirmation(response.readyForConfirmation);

        setMessages(previous => [
          ...previous,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: response.reply
          }
        ]);

      } else {

        const response = await sendAdminProductUpdateMessage({
          conversationId,
          message: trimmedMessage
        });

        setConversationId(response.conversationId);
        setDraft(response.draft);
        setReadyForConfirmation(response.readyForConfirmation);

        setMessages(previous => [
          ...previous,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: response.reply
          }
        ]);
      }

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

  // Confirm Add Product or Update Product.
  const confirmProduct = async (image?: File | null) => {

    if (!conversationId || !readyForConfirmation) {
      throw new Error("Please complete the product details first.");
    }

    if (mode === "add" && !image) {
      throw new Error("Please select a product image first.");
    }

    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {

      if (mode === "add") {

        const response = await confirmAdminProduct(
          conversationId,
          image as File
        );

        const productName =
          response.product?.name || "Product";

        setMessages(previous => [
          ...previous,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `${response.message} ${productName} has been added successfully.`
          }
        ]);

      } else {

        const response = await confirmAdminProductUpdate(
          conversationId,
          image
        );

        setMessages(previous => [
          ...previous,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              `Product "${response.name}" has been updated successfully.`
          }
        ]);
      }

      setConversationId(null);
      setDraft(null);
      setReadyForConfirmation(false);

    } catch (err) {

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Product operation failed.";

      setError(errorMessage);
      throw err;

    } finally {

      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  // Cancel the current draft.
  const cancelDraft = async () => {

    if (!conversationId || requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {

      if (mode === "add") {
        await cancelAdminProductDraft(conversationId);
      } else {
        await cancelAdminProductUpdate(conversationId);
      }

      setMessages(previous => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            mode === "add"
              ? "Your product draft has been cancelled. You can start again."
              : "Your product update has been cancelled. You can start again."
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
    mode,
    selectMode,
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
