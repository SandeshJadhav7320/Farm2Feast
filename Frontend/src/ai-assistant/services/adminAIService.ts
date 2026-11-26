
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

async function handleError(
  response: Response,
  defaultMessage: string
): Promise<never> {
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
// ADD PRODUCT APIs
// ==========================================

// Send Add Product AI message
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

// Confirm Add Product
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

// Cancel Add Product draft
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
// UPDATE PRODUCT APIs
// ==========================================

// Send Update Product AI message
export async function sendAdminUpdateChatMessage(
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

// Confirm Update Product
export async function confirmAdminProductUpdate(
  conversationId: string
): Promise<AdminProductUpdateResponse> {

  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/update-chat/${encodeURIComponent(conversationId)}/confirm`,
    {
      method: "POST",
      headers: getHeaders()
    }
  );

  if (!response.ok) {
    await handleError(response, "Product update failed.");
  }

  return response.json();
}

// Cancel Update Product draft
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
