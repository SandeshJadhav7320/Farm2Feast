
import { getToken } from "../../utils/auth";
import type { ChatRequest, ChatResponse } from "../types/chat";

const API_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL?.replace(/\/+$/, "");

console.log("AI API BASE URL:", API_BASE_URL);

export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {

  const token = getToken();

  // Check whether the customer is logged in  
  if (!token) {
    throw new Error("Please log in to use the AI assistant.");
  }

  // Send the message to Spring Boot
  const response = await fetch(
    `${API_BASE_URL}/api/conversations/chat`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(request),
    }
  );

  // Handle backend errors
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 403) {
      throw new Error("You are not authorized to use this assistant.");
    }

    throw new Error("Unable to get a response from the AI assistant.");
  }

  // Convert JSON response into a JavaScript object
  const data: ChatResponse = await response.json();

  return data;
}
