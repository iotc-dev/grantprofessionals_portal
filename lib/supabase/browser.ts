import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — use in "use client" components.
 * Uses the anon key (respects RLS policies).
 * 
 * Usage:
 *   import { supabase } from "@/lib/supabase/browser";
 *   const { data } = await supabase.from("clubs").select("*");
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);