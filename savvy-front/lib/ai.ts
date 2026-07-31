import apiClient from "./api";

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  llm_calls: number;
}

export interface ExtractedItem {
  name: string;
  quantity: number;
  unit_price: number | null;
  total: number | null;
}

export interface ExtractedReceipt {
  vendor_name: string | null;
  receipt_date: string | null;
  amount: number;
  currency: string;
  receipt_number: string | null;
  payment_method: string | null;
  category_hint: string | null;
  items: ExtractedItem[];
  notes: string | null;
  confidence: number;
}

export interface ExtractionResponse {
  receipt: ExtractedReceipt;
  model: string;
  usage: TokenUsage;
  saved_receipt_id: number | null;
}

export interface SourceReceipt {
  id: number | null;
  vendor_name: string | null;
  amount: number | null;
  receipt_date: string | null;
  category: string | null;
  score: number;
}

export interface AskResponse {
  answer: string;
  sources: SourceReceipt[];
  model: string;
  usage: TokenUsage;
}

export interface ToolCall {
  tool: string;
  arguments: Record<string, unknown>;
  result: unknown;
}

export interface AdvisorResponse {
  answer: string;
  tool_calls: ToolCall[];
  iterations: number;
  model: string;
  usage: TokenUsage;
}

export interface AiHealth {
  llm_configured: boolean;
  llm_model: string;
  vision_model: string;
  base_url: string | null;
  vectors_indexed: number;
}

export const aiHealth = async (): Promise<AiHealth> => {
  const res = await apiClient.get("/ai/health");
  return res.data;
};

export const askSavy = async (question: string, topK = 6): Promise<AskResponse> => {
  const res = await apiClient.post("/ai/ask", { question, top_k: topK });
  return res.data;
};

export const getAdvice = async (question?: string): Promise<AdvisorResponse> => {
  const res = await apiClient.post("/ai/advisor", { question: question ?? null });
  return res.data;
};

export const extractReceiptImage = async (
  file: File,
  save = false
): Promise<ExtractionResponse> => {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient.post(`/ai/extract-image?save=${save}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
