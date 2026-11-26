import { getToken } from "../../utils/auth";

import type {
  AdminChatRequest,
  AdminChatResponse,
  AdminProductCreateResponse,
  AdminProductUpdateChatResponse,
  AdminProductUpdateResponse,
} from "../types/adminAI";

const API_BASE_URL = (
  import.meta.env.VITE_AI_API_BASE_URL ||
  "https://farm2feast-ai.onrender.com"
).replace(/\/+$/, "");

async function getHeaders() {
  const token = await getToken();

  if (!token) {
    throw new Error("Please login again. Authentication token not found.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function handleError(
  response: Response,
  defaultMessage: string
): Promise<never> {
  if (response.status === 401) {
    throw new Error("Your session has expired. Please login again.");
  }

  if (response.status === 403) {
    throw new Error("You do not have admin permission.");
  }

  const message = await response.text();

  throw new Error(message || defaultMessage);
}

export const adminAIService = {
  // ---------------- ADD PRODUCT CHAT ----------------

  async sendAdminChatMessage(
    request: AdminChatRequest
  ): Promise<AdminChatResponse> {
    const headers = await getHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/admin-ai/chat`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      await handleError(response, "Unable to process add product request.");
    }

    return response.json();
  },

  async confirmAdminProduct(
    conversationId: string,
    image: File
  ): Promise<AdminProductCreateResponse> {
    const headers = await getHeaders();

    const formData = new FormData();
    formData.append("image", image);

    const response = await fetch(
      `${API_BASE_URL}/api/admin-ai/chat/${conversationId}/confirm`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      await handleError(response, "Unable to add product.");
    }

    return response.json();
  },

  async cancelAdminProductDraft(
    conversationId: string
  ): Promise<void> {
    const headers = await getHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/admin-ai/chat/${conversationId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      await handleError(response, "Unable to cancel product draft.");
    }
  },

  // ---------------- UPDATE PRODUCT CHAT ----------------

  async sendAdminProductUpdateMessage(
    request: AdminChatRequest
  ): Promise<AdminProductUpdateChatResponse> {
    const headers = await getHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/admin-ai/update-chat`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      await handleError(response, "Unable to process update product request.");
    }

    return response.json();
  },

  async confirmAdminProductUpdate(
    conversationId: string,
    image?: File | null
  ): Promise<AdminProductUpdateResponse> {
    const headers = await getHeaders();

    const formData = new FormData();

    if (image) {
      formData.append("image", image);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/admin-ai/update-chat/${conversationId}/confirm`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      await handleError(response, "Unable to update product.");
    }

    return response.json();
  },

  async cancelAdminProductUpdate(
    conversationId: string
  ): Promise<void> {
    const headers = await getHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/admin-ai/update-chat/${conversationId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      await handleError(response, "Unable to cancel product update.");
    }
  },
};