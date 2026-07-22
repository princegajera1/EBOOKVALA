import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// TODO (Capacitor Native Auth): For OAuth login redirect handling in native apps,
// ensure "capacitor://localhost" is added as an Authorized Redirect URL in Supabase Dashboard:
// (Supabase Dashboard > Authentication > URL Configuration)

// Export null if credentials are not configured, preventing crash
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export default supabase;
