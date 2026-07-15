import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Capture hash BEFORE createClient processes and clears it
export const initialHash = window.location.hash;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Decode a JWT and return its payload — only for debug logging, never for auth decisions
function debugJwt(label: string, token: string | null | undefined) {
  if (!token) { console.warn(`🔑 [${label}] token is null/undefined`); return; }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expMs  = payload.exp * 1000;
    const nowMs  = Date.now();
    const diffSec = Math.round((expMs - nowMs) / 1000);
    const expired = nowMs > expMs;
    console.log(
      `🔑 [${label}] exp=${new Date(expMs).toISOString()}  now=${new Date(nowMs).toISOString()}  diff=${diffSec}s  EXPIRED=${expired}`
    );
  } catch {
    console.warn(`🔑 [${label}] could not decode token`);
  }
}

export async function getToken(): Promise<string> {
  console.log('🔑 [getToken] calling supabase.auth.getSession()...');
  const { data: { session: cached }, error: sessionError } = await supabase.auth.getSession();
  console.log('🔑 [getToken] getSession result:', { hasSession: !!cached, error: sessionError?.message });
  debugJwt('getToken/getSession', cached?.access_token);

  // If getSession returned a token that looks expired, force a refresh
  let token = cached?.access_token;
  if (token) {
    try {
      const exp = JSON.parse(atob(token.split('.')[1])).exp * 1000;
      if (Date.now() > exp) {
        console.warn('🔑 [getToken] getSession returned an expired token — forcing refreshSession()');
        const { data: { session: refreshed }, error: refreshError } = await supabase.auth.refreshSession();
        console.log('🔑 [getToken] refreshSession result:', { hasSession: !!refreshed, error: refreshError?.message });
        debugJwt('getToken/refreshSession', refreshed?.access_token);
        token = refreshed?.access_token ?? undefined;
      }
    } catch { /* JWT decode failed — keep original token and let the server decide */ }
  }

  if (!token) throw new Error('Session expired — please log in again.');
  return token;
}
