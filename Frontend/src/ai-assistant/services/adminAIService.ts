
import { getToken } from "../../utils/auth";

import type {
  AdminChatRequest,
  AdminChatResponse,
  AdminProductCreateResponse,
  AdminProductUpdateChatResponse,
  AdminProductUpdateResponse
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

async function handleError(response: Response, defaultMessage: string) {
  const error = await response.text();

  if (response.status === 401) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (response.status === 403) {
    throw new Error("Only an admin can use this assistant.");
  }

  throw new Error(error || defaultMessage);
}

// ==========================================
// ADD PRODUCT CHAT
// ==========================================

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
    await handleError(response, "Unable to contact Admin AI.");
  }

  return response.json();
}

// Confirm product creation
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
    await handleError(response, "Product creation failed.");
  }

  return response.json();
}

// Cancel product creation draft
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
    await handleError(response, "Unable to cancel product draft.");
  }
}

// ==========================================
// UPDATE PRODUCT CHAT
// ==========================================

export async function sendAdminProductUpdateMessage(
  request: AdminChatRequest
): Promise<AdminProductUpdateChatResponse> {

  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/update-chat`,
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
    await handleError(response, "Unable to contact Product Update AI.");
  }

  return response.json();
}

// Confirm product update
// Image is optional.
export async function confirmAdminProductUpdate(
  conversationId: string,
  image?: File | null
): Promise<AdminProductUpdateResponse> {

  const formData = new FormData();

  if (image) {
    formData.append("image", image);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/update-chat/${encodeURIComponent(conversationId)}/confirm`,
    {
      method: "POST",
      headers: getHeaders(),
      body: formData
    }
  );

  if (!response.ok) {
    await handleError(response, "Product update failed.");
  }

  return response.json();
}

// Cancel product update draft
export async function cancelAdminProductUpdate(
  conversationId: string
): Promise<void> {

  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/update-chat/${encodeURIComponent(conversationId)}`,
    {
      method: "DELETE",
      headers: getHeaders()
    }
  );

  if (!response.ok) {
    await handleError(response, "Unable to cancel product update.");
  }
}
