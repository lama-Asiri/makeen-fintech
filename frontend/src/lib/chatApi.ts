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
  File: { name: string; filetype: string } | null; // joined from File table — null if no file uploaded yet
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
export async function saveMessageAPI(
  token: string,
  chatId: number,
  queryText: string,
  answer: string,
  explanation = ''
): Promise<void> {
  const res = await fetch(`${BASE}/auth/saveMessage`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ chat_id: chatId, query_text: queryText, answer, explanation }),
  });
  if (!res.ok) throw new Error(await res.text());
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

export interface BackendMessage {
  QUERY_ID: number;
  query_text: string;
  created_at: string;
  CHAT_ID: number;
  Response: { answer: string; explanation: string; created_at: string }[] | null;
}
