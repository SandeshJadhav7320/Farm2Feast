
import { useRef, useState } from "react";

import {
  sendAdminChatMessage,
  confirmAdminProduct,
  cancelAdminProductDraft,
  sendAdminUpdateChatMessage,
  confirmAdminProductUpdate,
  cancelAdminProductUpdate
} from "../services/adminAIService";

import type {
  AdminChatMessage,
  AdminProductDraft,
  AdminProductUpdateDraft,
  AdminChatMode
} from "../types/adminAI";

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
          "Hello Admin! Welcome to Farm2Feast AI. I can help you add new products or update existing products. What would you like to do?"
      }
    ]);

  const [draft, setDraft] =
    useState<AdminProductDraft | AdminProductUpdateDraft | null>(null);

  const [readyForConfirmation, setReadyForConfirmation] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const requestInProgress = useRef(false);

  // Detect the operation from the admin's first message.
  const detectMode = (message: string): AdminChatMode => {

    const text = message.toLowerCase();

    const updatePattern =
      /\b(update|edit|modify|change|alter|revise)\b/;

    const addPattern =
      /\b(add|create|insert|new product)\b/;

    if (updatePattern.test(text)) {
      return "update";
    }

    if (addPattern.test(text)) {
      return "add";
    }

    return null;
  };

  // Add assistant message
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

  // Reset conversation after completion or cancellation.
  const resetConversation = () => {
    setConversationId(null);
    setMode(null);
    setDraft(null);
    setReadyForConfirmation(false);
  };

  // ==========================================
  // SEND CHAT MESSAGE
  // ==========================================

  const sendMessage = async (message: string) => {

    const trimmedMessage = message.trim();

    if (!trimmedMessage || requestInProgress.current) {
      return;
    }

    // Detect Add or Update from the first message.
    let selectedMode = mode;

    if (!selectedMode) {
      selectedMode = detectMode(trimmedMessage);

      if (!selectedMode) {
        setMessages(previous => [
          ...previous,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmedMessage
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Would you like me to add a new product or update an existing product? Please tell me in your own words."
          }
        ]);

        return;
      }

      setMode(selectedMode);
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

      const request = {
        conversationId,
        message: trimmedMessage
      };

      if (selectedMode === "add") {

        const response = await sendAdminChatMessage(request);

        setConversationId(response.conversationId);
        setDraft(response.draft);
        setReadyForConfirmation(response.readyForConfirmation);

        addAssistantMessage(response.reply);

      } else {

        const response = await sendAdminUpdateChatMessage(request);

        setConversationId(response.conversationId);
        setDraft(response.draft);
        setReadyForConfirmation(response.readyForConfirmation);

        addAssistantMessage(response.reply);
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

  // ==========================================
  // CONFIRM ADD PRODUCT
  // ==========================================

  const confirmProduct = async (image: File) => {

    if (
      mode !== "add" ||
      !conversationId ||
      !readyForConfirmation
    ) {
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
        response.product?.name ||
        (draft as AdminProductDraft | null)?.name ||
        "Product";

      addAssistantMessage(
        `${response.message} ${productName} has been added successfully.`
      );

      resetConversation();

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

  // ==========================================
  // CONFIRM UPDATE PRODUCT
  // ==========================================

  const confirmProductUpdate = async () => {

    if (
      mode !== "update" ||
      !conversationId ||
      !readyForConfirmation
    ) {
      throw new Error("Please review and confirm the product changes first.");
    }

    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {

      const response = await confirmAdminProductUpdate(
        conversationId
      );

      addAssistantMessage(
        `Product "${response.name}" (ID: ${response.id}) has been updated successfully.`
      );

      resetConversation();

    } catch (err) {

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Product update failed.";

      setError(errorMessage);
      throw err;

    } finally {

      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  // ==========================================
  // CANCEL CURRENT DRAFT
  // ==========================================

  const cancelDraft = async () => {

    if (!conversationId || !mode || requestInProgress.current) {
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

      addAssistantMessage(
        "Your current operation has been cancelled. You can start a new request."
      );

      resetConversation();

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

  return {
    messages,
    conversationId,
    mode,
    draft,
    readyForConfirmation,
    isLoading,
    error,
    sendMessage,
    confirmProduct,
    confirmProductUpdate,
    cancelDraft
  };
}
