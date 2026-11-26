
export type AdminChatMode = "add" | "update";

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

export interface AdminChatRequest {
  conversationId: string | null;
  message: string;
}

export interface AdminChatResponse {
  conversationId: string;
  reply: string;
  draft: AdminProductDraft;
  readyForConfirmation: boolean;
}

export interface AdminProductUpdateChatResponse {
  conversationId: string;
  reply: string;
  draft: AdminProductUpdateDraft;
  readyForConfirmation: boolean;
}

export interface AdminProductCreateResponse {
  message: string;
  product?: {
    id?: number;
    name?: string;
    [key: string]: unknown;
  };
}

export interface AdminProductUpdateResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
}

export interface AdminChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
