
import { getToken } from "../../utils/auth";

import type {
  AdminAssistantChatRequest,
  AdminAssistantChatResponse,
  AdminAssistantConfirmResponse
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

// Send every admin request through the unified AI endpoint.
export async function sendAdminAssistantMessage(
  request: AdminAssistantChatRequest
): Promise<AdminAssistantChatResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/assistant/chat`,
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

// Confirm Add Product or Update Product.
// An image is required by the Add Product backend flow,
// but optional for Update Product.
export async function confirmAdminAssistantOperation(
  conversationId: string,
  image?: File | null
): Promise<AdminAssistantConfirmResponse> {
  const headers = getHeaders();

  let body: FormData | undefined;

  if (image) {
    body = new FormData();
    body.append("image", image);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/assistant/${encodeURIComponent(
      conversationId
    )}/confirm`,
    {
      method: "POST",
      headers,
      body
    }
  );

  if (!response.ok) {
    await handleError(
      response,
      "Unable to confirm this operation."
    );
  }

  return response.json();
}

// Cancel the current Add Product or Update Product operation.
export async function cancelAdminAssistantOperation(
  conversationId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin-ai/assistant/${encodeURIComponent(
      conversationId
    )}`,
    {
      method: "DELETE",
      headers: getHeaders()
    }
  );

  if (!response.ok) {
    await handleError(
      response,
      "Unable to cancel the current operation."
    );
  }
}
