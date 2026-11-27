
export interface AdminAssistantChatRequest {
  conversationId: string | null;
  message: string;
}

export type AdminAssistantOperation =
  | "ADD_PRODUCT"
  | "UPDATE_PRODUCT"
  | "ORDER"
  | "UNKNOWN";

export interface AdminProductDraft {
  name: string | null;
  description: string | null;
  price: number | null;
  quantity: number | null;
  category: string | null;
}

export interface AdminProductUpdateDraft {
  productId: number | null;

  originalName: string | null;
  originalDescription: string | null;
  originalPrice: number | null;
  originalQuantity: number | null;
  originalCategory: string | null;

  name: string | null;
  description: string | null;
  price: number | null;
  quantity: number | null;
  category: string | null;

  hasChanges: boolean;
}

export interface AdminAssistantChatResponse {
  conversationId: string;
  operation: AdminAssistantOperation;
  reply: string;
  draft: AdminProductDraft | AdminProductUpdateDraft | null;
  readyForConfirmation: boolean;

  orderData?: unknown;
  orderDataType?: string | null;
}

export interface AdminAssistantConfirmResponse {
  message?: string;

  product?: {
    id?: number;
    name?: string;
    [key: string]: unknown;
  };

  id?: number;
  name?: string;

  [key: string]: unknown;
}

export interface AdminChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;

  orderData?: unknown;
  orderDataType?: string | null;
}

// The operation selected by the backend for this conversation.
export type AdminChatMode =
  | "ADD_PRODUCT"
  | "UPDATE_PRODUCT"
  | "ORDER"
  | null;
