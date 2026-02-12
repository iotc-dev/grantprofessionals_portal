import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/auth/club-logout
 * Destroys the club session
 */
export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("club_session")?.value;

  if (sessionToken) {
    // Remove from DB
    await supabaseAdmin
      .from("club_sessions")
      .delete()
      .eq("session_token", sessionToken);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("club_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // Expire immediately
  });

  return response;
}