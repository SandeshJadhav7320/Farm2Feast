
export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  quantity?: number | null;
  category?: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

export interface ChatRequest {
  conversationId: string;
  message: string;
}

export interface ChatResponse {
  response: string;
  products?: Product[];
}
