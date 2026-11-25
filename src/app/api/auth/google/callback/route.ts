import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { signToken, hashPassword } from "@/lib/auth";
import {
  verifyOAuthState,
  exchangeGoogleCodeForTokens,
  fetchGoogleUserProfile,
} from "@/lib/googleAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const googleError = url.searchParams.get("error");

    // 1. Handle user cancellation or denial on Google consent screen
    if (googleError) {
      console.warn("Google OAuth callback returned error:", googleError);
      return NextResponse.redirect(new URL("/login?error=cancelled", req.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/login?error=missing_code", req.url));
    }

    // 2. Validate CSRF state against HTTP-only cookie
    const cookiesHeader = req.headers.get("cookie") || "";
    const cookieNonce = cookiesHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("beenext_oauth_state="))
      ?.split("=")[1];

    const { isValid, from } = verifyOAuthState(state, cookieNonce);
    if (!isValid) {
      console.error("Invalid or expired OAuth state parameter.");
      return NextResponse.redirect(new URL("/login?error=invalid_state", req.url));
    }

    // 3. Exchange authorization code for tokens
    const tokens = await exchangeGoogleCodeForTokens(code, req);
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/login?error=token_exchange_failed", req.url));
    }

    // 4. Fetch Google profile
    const profile = await fetchGoogleUserProfile(tokens.access_token);
    if (!profile.email || profile.email_verified !== true) {
      console.error("Google user email is missing or not verified by Google.");
      return NextResponse.redirect(new URL("/login?error=email_not_verified", req.url));
    }

    const normalizedEmail = profile.email.toLowerCase().trim();

    // 5. Account Lookup & Secure Account Linking
    // A. Check if user with this googleId already exists
    let user = await prisma.user.findUnique({
      where: { googleId: profile.sub },
    });

    if (user) {
      // Existing Google user: update avatar if missing, touch updatedAt
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          updatedAt: new Date(),
          avatar: user.avatar || profile.picture || undefined,
        },
      });
    } else {
      // B. Check if user with this email already exists (Account Linking)
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingEmailUser) {
        // Securely link Google account to existing email/password account
        user = await prisma.user.update({
          where: { id: existingEmailUser.id },
          data: {
            googleId: profile.sub,
            avatar: existingEmailUser.avatar || profile.picture || undefined,
            updatedAt: new Date(),
          },
        });
      } else {
        // C. Create new user with NORMAL membership tier
        const randomDummyPassword = crypto.randomUUID() + crypto.randomBytes(32).toString("hex");
        const passwordHash = await hashPassword(randomDummyPassword);

        const displayName = (profile.name || normalizedEmail.split("@")[0] || "Google User").trim();

        user = await prisma.user.create({
          data: {
            name: displayName,
            email: normalizedEmail,
            googleId: profile.sub,
            passwordHash,
            role: "USER",
            membershipType: "NORMAL",
            avatar:
              profile.picture ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`,
          },
        });
      }
    }

    // 6. Sign JWT session token
    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // 7. Prepare redirection
    const destination = from && from.startsWith("/") && !from.startsWith("//") ? from : "/";
    const redirectUrl = new URL(destination, req.url);
    const response = NextResponse.redirect(redirectUrl);

    // 8. Set session cookie
    response.cookies.set({
      name: process.env.SESSION_COOKIE_NAME || "beenext_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // 9. Clear OAuth state cookie
    response.cookies.set({
      name: "beenext_oauth_state",
      value: "",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
  }
}
