
import { getToken } from "../../utils/auth";

import type {
  AdminChatRequest,
  AdminChatResponse,
  AdminProductCreatedResponse,
} from "../types/adminAI";

const API_BASE_URL = (
  import.meta.env.VITE_AI_API_BASE_URL ||
  "https://farm2feast-ai.onrender.com"
).replace(/\/+$/, "");

function getAdminHeaders(): HeadersInit {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in as an admin.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

// Send a message to Admin AI
export async function sendAdminChatMessage(
  request: AdminChatRequest
): Promise<AdminChatResponse> {

  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/chat`,
    {
      method: "POST",
      headers: {
        ...getAdminHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 403) {
      throw new Error("Only administrators can use this assistant.");
    }

    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
      errorData?.error ||
      "Unable to contact Admin AI."
    );
  }

  return response.json();
}

// Confirm product creation and upload image
export async function confirmAdminProduct(
  conversationId: string,
  image: File
): Promise<AdminProductCreatedResponse> {

  const formData = new FormData();

  formData.append("image", image);

  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/chat/${encodeURIComponent(
      conversationId
    )}/confirm`,
    {
      method: "POST",
      headers: getAdminHeaders(),
      body: formData,
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 403) {
      throw new Error("You are not authorized to add products.");
    }

    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
      errorData?.error ||
      "Product creation failed."
    );
  }

  return response.json();
}

// Cancel product creation
export async function cancelAdminProductDraft(
  conversationId: string
): Promise<void> {

  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/chat/${encodeURIComponent(
      conversationId
    )}`,
    {
      method: "DELETE",
      headers: getAdminHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Unable to cancel product creation.");
  }
}
