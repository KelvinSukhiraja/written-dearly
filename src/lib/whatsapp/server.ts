import "server-only";
import { createClient } from "@supabase/supabase-js";
import { readConfig } from "./core";

export function whatsappConfig() { return readConfig(process.env); }
export function deliveryStore() {
  const key = process.env.SUPABASE_SECRET_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!key || !url) throw new Error("WhatsApp delivery tracking is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
