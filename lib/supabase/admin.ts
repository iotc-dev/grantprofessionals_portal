import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — bypasses RLS using the service_role key.
 * ONLY use in:
 *   - API route handlers (app/api/...)
 *   - Webhook handlers
 *   - Club auth (custom ABN+passcode flow)
 *   - Server-side operations that need full DB access
 *
 * NEVER import this in client components or expose to the browser.
 *
 * Usage:
 *   import { supabaseAdmin } from "@/lib/supabase/admin";
 *   const { data } = await supabaseAdmin.from("clubs").select("*");
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);