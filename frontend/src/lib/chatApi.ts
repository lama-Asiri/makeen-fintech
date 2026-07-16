// chatApi.ts
// All backend API calls related to chat management.
// Every function takes an access_token so we can pass the Authorization header.
// The base URL comes from VITE_API_URL in the .env file.

const BASE = import.meta.env.VITE_API_URL;

// Shared auth header builder — avoids repeating this in every call
const authHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BackendChat {
  CHAT_ID: number;
  Title: string;
  USER_ID: string;
  Created_at: string;
  File: { name: string; filetype: string; target_column: string | null } | null; // joined from File table
}

// ─── API Functions ────────────────────────────────────────────────────────────

// Create a new chat in the DB — returns the CHAT_ID assigned by the backend
// We store this ID so we can call deleteChat and renameChat later
export async function addChatAPI(token: string, title: string): Promise<number> {
  const res = await fetch(`${BASE}/auth/addChat`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ Title: title }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.CHAT_ID;
}

// Fetch all chats for the logged-in user from the DB
// Used on mount to load chat history instead of relying on localStorage alone
export async function viewHistoryAPI(token: string): Promise<BackendChat[]> {
  const res = await fetch(`${BASE}/auth/viewHistory`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.chats as BackendChat[];
}

// Delete a single chat from the DB by its backend CHAT_ID
// Called after the 8-second undo window closes (not immediately on click)
export async function deleteChatAPI(token: string, chatId: number): Promise<void> {
  const res = await fetch(`${BASE}/auth/deleteChat?chat_id=${chatId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

// Delete ALL chats for the logged-in user — called by the "Clear all" button
export async function deleteAllChatsAPI(token: string): Promise<void> {
  const res = await fetch(`${BASE}/auth/deleteAllChats`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

// Save a user message + AI response pair to the DB after each exchange.
// Called right after the AI response is added to the chat state.
// Returns responseId so the frontend can link ratings to this response.
// xaiData is serialized as JSON into the explanation field so it can be restored after login.
export async function saveMessageAPI(
  token: string,
  chatId: number,
  queryText: string,
  answer: string,
  xaiData?: object
): Promise<{ responseId: number }> {
  const res = await fetch(`${BASE}/auth/saveMessage`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      chat_id: chatId,
      query_text: queryText,
      answer,
      // Serialize xaiData as JSON string so it survives the DB round-trip
      explanation: xaiData ? JSON.stringify(xaiData) : '',
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { responseId: data.RESPONSE_ID };
}

// Load all messages for a chat from the DB.
// Called when the user switches to a chat so messages persist across sessions.
export async function getMessagesAPI(token: string, chatId: number): Promise<BackendMessage[]> {
  const res = await fetch(`${BASE}/auth/getMessages/${chatId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.messages as BackendMessage[];
}

// Rename a chat in the DB — called when the user confirms a rename in the sidebar.
export async function renameChatAPI(token: string, chatId: number, newTitle: string): Promise<void> {
  const res = await fetch(`${BASE}/auth/renameChat`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ chat_id: chatId, new_title: newTitle }),
  });
  if (!res.ok) throw new Error(await res.text());
}

// Upload a CSV/XLSX file to Supabase Storage via the backend.
// Returns the list of column names parsed from the file — used for the target column picker.
// Uses multipart/form-data — do NOT set Content-Type manually, the browser sets it with the boundary.
export async function uploadFileAPI(token: string, file: File, chatId: number): Promise<string[]> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('chat_id', chatId.toString());
  const res = await fetch(`${BASE}/auth/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }, // no Content-Type — browser handles it
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.columns as string[];
}

export interface ParseResult {
  rows: number;
  columns: string[];
  id_columns: string[];
  preview_rows: string[][];
}

export async function parseFileAPI(token: string, chatId: number): Promise<ParseResult> {
  const res = await fetch(`${BASE}/auth/parse`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ chat_id: chatId }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { rows: data.rows, columns: data.columns, id_columns: data.id_columns, preview_rows: data.preview_rows ?? [] };
}

export interface UploadModelResult {
  taskType: 'classification' | 'regression';
  classLabels: string[] | null;
  topFeatures: { name: string; importance: number }[] | null;
}

// "Bring your own model" — mirrors uploadFileAPI's multipart pattern. Hits /uploadModel
// directly (no /auth prefix — matches whatIfAPI's /whatif below, both mounted at
// data_processor.py's router root). Requires /auth/parse to have already succeeded
// for this chat_id server-side.
export async function uploadModelAPI(
  token: string,
  chatId: number,
  targetColumn: string,
  taskType: 'classification' | 'regression',
  file: File
): Promise<UploadModelResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('chat_id', chatId.toString());
  formData.append('target_column', targetColumn);
  formData.append('task_type', taskType);
  const res = await fetch(`${BASE}/uploadModel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }, // no Content-Type — browser handles it
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { taskType: data.task_type, classLabels: data.class_labels ?? null, topFeatures: data.top_features ?? null };
}

export interface ReportCase {
  index: number;
  query: string;
  answer: string;
  prediction: string;
  shapValues: { feature: string; value: number }[];
  compliance: { regulation: string; text: string }[];
}

export interface ReportData {
  cases: ReportCase[];
  summary: string;
}

// Full-chat report — aggregates every Q&A pair for this chat plus an AI-written overall
// summary of patterns/risk drivers across all cases. Hits /generate-report/{chat_id}
// directly (no /auth prefix — matches whatIfAPI's /whatif below).
export async function generateReportAPI(token: string, chatId: number): Promise<ReportData> {
  const res = await fetch(`${BASE}/generate-report/${chatId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export interface WhatIfResult {
  prediction: string;
  confidence: number | null;
  shap_values: { feature: string; shap_value: number }[];
}

export async function whatIfAPI(
  token: string,
  chatId: number,
  featureValues: Record<string, string | number>
): Promise<WhatIfResult> {
  const res = await fetch(`${BASE}/whatif`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ chat_id: chatId, feature_values: featureValues }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export interface BackendMessage {
  QUERY_ID: number;
  query_text: string;
  created_at: string;
  CHAT_ID: number;
  Response: { RESPONSE_ID: number; answer: string; explanation: string; created_at: string }[] | null;
}

// ─── Dashboard Overview ───────────────────────────────────────────────────────

export interface DashboardTopDriver {
  feature: string;
  importance: number;
}

export interface DashboardRecentResult {
  id_value: string | null;
  prediction: string | null;
  confidence: number | null; // already 0-100 percentage from backend
}

export interface DashboardOverviewNoData {
  stage: 'no_data' | 'no_target';
  message: string;
}

export interface DashboardOverviewTrained {
  stage: 'trained';
  target_column: string;
  task_type: 'classification' | 'regression';
  records_processed: number;
  top_drivers: DashboardTopDriver[];
  recent_results: DashboardRecentResult[];
  // classification only
  avg_confidence?: number | null;
  outcome_split?: { label: string; count: number; rate: number }[];
  // regression only
  prediction_stats?: { avg: number | null; min: number | null; max: number | null };
}

export type DashboardOverview = DashboardOverviewNoData | DashboardOverviewTrained;

export async function getDashboardOverviewAPI(chatId: number, token: string): Promise<DashboardOverview> {
  const res = await fetch(`${BASE}/dashboard/overview?chat_id=${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
  return res.json();
}
