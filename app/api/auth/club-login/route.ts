import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/auth/club-login
 * Authenticates a club via ABN + passcode (HMAC-SHA256)
 * 
 * Body: { abn: string, passcode: string }
 *   OR: { code: string } (magic link login)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let club;

    if (body.code) {
      // --- Magic link login: validate code directly ---
      const { data, error } = await supabaseAdmin
        .from("clubs")
        .select("id, abn, code_version, shortened_name, legal_entity_name")
        .eq("access_code", body.code.toUpperCase())
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "Invalid or expired access code." },
          { status: 401 }
        );
      }
      club = data;

    } else if (body.abn && body.passcode) {
      // --- Manual login: ABN + passcode ---
      const abnClean = body.abn.replace(/\s/g, "");

      if (!/^\d{11}$/.test(abnClean)) {
        return NextResponse.json(
          { error: "Invalid ABN format." },
          { status: 400 }
        );
      }

      // Look up club by ABN
      const { data, error } = await supabaseAdmin
        .from("clubs")
        .select("id, abn, code_version, shortened_name, legal_entity_name")
        .eq("abn", abnClean)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "No club found with this ABN." },
          { status: 401 }
        );
      }

      // Generate expected code and compare
      const expectedCode = generateClubCode(abnClean, data.code_version);
      if (body.passcode.toUpperCase() !== expectedCode) {
        return NextResponse.json(
          { error: "Invalid passcode." },
          { status: 401 }
        );
      }

      club = data;

    } else {
      return NextResponse.json(
        { error: "Missing ABN/passcode or code." },
        { status: 400 }
      );
    }

    // --- Create session ---
    const sessionToken = createHmac("sha256", process.env.CLUB_AUTH_HMAC_SECRET!)
      .update(`${club.id}-${Date.now()}-${Math.random()}`)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await supabaseAdmin.from("club_sessions").insert({
      club_id: club.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    });

    // --- Check if onboarding is complete ---
    const { data: profile } = await supabaseAdmin
      .from("club_profiles")
      .select("id")
      .eq("club_id", club.id)
      .single();

    const isOnboarded = !!profile;

    // --- Set session cookie and return ---
    const response = NextResponse.json({
      success: true,
      clubId: club.id,
      clubName: club.shortened_name || club.legal_entity_name,
      redirect: isOnboarded ? "/club-dashboard" : "/onboarding",
    });

    response.cookies.set("club_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;

  } catch (err) {
    console.error("Club login error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * Generate club access code using HMAC-SHA256
 * Code = HMAC-SHA256(ABN + "-" + version, SECRET) → first 8 chars, uppercase
 */
function generateClubCode(abn: string, version: number): string {
  const input = `${abn}-${version}`;
  const hash = createHmac("sha256", process.env.CLUB_AUTH_HMAC_SECRET!)
    .update(input)
    .digest("hex");
  return hash.slice(0, 8).toUpperCase();
}