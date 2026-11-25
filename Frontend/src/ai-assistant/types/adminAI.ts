
export interface AdminProductDraft {
  name: string | null;
  description: string | null;
  price: number | null;
  quantity: number | null;
  category: string | null;
}

export interface AdminChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
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

export interface AdminProductCreatedResponse {
  message: string;
  product: {
    id?: number;
    name?: string;
    [key: string]: unknown;
  };
}
