import { NextResponse } from "next/server";
import {
  isGoogleAuthConfigured,
  generateGoogleOAuthUrl,
  generateOAuthState,
} from "@/lib/googleAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fromParam = url.searchParams.get("from") || "/";

    // Validate safe return path
    const safeFrom =
      fromParam.startsWith("/") && !fromParam.startsWith("//") ? fromParam : "/";

    if (!isGoogleAuthConfigured()) {
      console.warn("Google OAuth requested but GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not configured.");
      return NextResponse.redirect(new URL("/login?error=google_not_configured", req.url));
    }

    const { stateParam, stateCookieValue } = generateOAuthState(safeFrom);
    const googleAuthUrl = generateGoogleOAuthUrl(stateParam, req);

    const response = NextResponse.redirect(googleAuthUrl);

    // Set short-lived state cookie for CSRF validation (10 minutes)
    response.cookies.set({
      name: "beenext_oauth_state",
      value: stateCookieValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error initiating Google OAuth:", error);
    return NextResponse.redirect(new URL("/login?error=google_init_failed", req.url));
  }
}
