
import { getToken } from "../../utils/auth";

import type {
  AdminChatRequest,
  AdminChatResponse,
  AdminProductCreateResponse
} from "../types/adminAI";

const API_BASE_URL = (
  import.meta.env.VITE_AI_API_BASE_URL ||
  "https://farm2feast-ai.onrender.com"
).replace(/\/+$/, "");

function getHeaders(): HeadersInit {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in using your admin account.");
  }

  return {
    Authorization: `Bearer ${token}`
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
        ...getHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    const error = await response.text();

    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 403) {
      throw new Error("Only an admin can use this assistant.");
    }

    throw new Error(error || "Unable to contact Admin AI.");
  }

  return response.json();
}

// Upload image and confirm product creation
export async function confirmAdminProduct(
  conversationId: string,
  image: File
): Promise<AdminProductCreateResponse> {

  const formData = new FormData();

  formData.append("image", image);

  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/chat/${encodeURIComponent(conversationId)}/confirm`,
    {
      method: "POST",
      headers: getHeaders(),
      body: formData
    }
  );

  if (!response.ok) {
    const error = await response.text();

    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 403) {
      throw new Error("You are not authorized to add products.");
    }

    throw new Error(error || "Product creation failed.");
  }

  return response.json();
}

// Cancel product draft
export async function cancelAdminProductDraft(
  conversationId: string
): Promise<void> {

  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/chat/${encodeURIComponent(conversationId)}`,
    {
      method: "DELETE",
      headers: getHeaders()
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Unable to cancel product draft.");
  }
}
