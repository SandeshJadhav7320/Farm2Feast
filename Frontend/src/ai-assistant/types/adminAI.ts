export type AdminChatMode = "add" | "update";

export interface AdminProductDraft {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string | null;
}

export interface AdminProductUpdateDraft {
  productId: number;
  originalName: string;
  originalDescription: string;
  originalPrice: number;
  originalQuantity: number;
  originalCategory: string;

  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;

  hasChanges: boolean;
}

export interface AdminChatRequest {
  conversationId: string | null;
  message: string;
}

export interface AdminChatResponse {
  conversationId: string;
  reply: string;
  draft: AdminProductDraft | null;
  readyForConfirmation: boolean;
}

export interface AdminProductUpdateChatResponse {
  conversationId: string;
  reply: string;
  draft: AdminProductUpdateDraft | null;
  readyForConfirmation: boolean;
}

export interface AdminProductCreateResponse {
  message: string;
  product?: {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: string;
    imageUrl?: string;
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