import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (Next.js 16) — runs on every request to refresh the Supabase auth session.
 * Also handles route protection:
 *   - /admin-* routes → must be authenticated staff
 *   - /manage-* routes → must be authenticated staff
 *   - /club-* routes → must have valid club session
 *   - /onboarding → must have valid club session
 *   - /admin-login, /club-login → public
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session (important — do NOT remove this)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // --- Staff route protection ---
  const isStaffRoute =
    pathname.startsWith("/admin-dashboard") ||
    pathname.startsWith("/manage-") ||
    pathname.startsWith("/settings");

  if (isStaffRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-login";
    return NextResponse.redirect(url);
  }

  // --- Club route protection ---
  // Club auth uses custom sessions (not Supabase Auth),
  // so we check for the club session cookie instead.
  const isClubRoute =
    pathname.startsWith("/club-dashboard") ||
    pathname.startsWith("/onboarding");

  if (isClubRoute) {
    const clubSession = request.cookies.get("club_session")?.value;
    if (!clubSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/club-login";
      return NextResponse.redirect(url);
    }
  }

  // --- Redirect authenticated staff away from login ---
  if (pathname === "/admin-login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     * - API routes (handled by their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|api/).*)",
  ],
};