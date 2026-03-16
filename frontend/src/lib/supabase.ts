import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Capture hash BEFORE createClient processes and clears it
export const initialHash = window.location.hash;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
