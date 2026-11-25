import crypto from "crypto";

export interface GoogleProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface GoogleOAuthTokens {
  access_token: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

export function isGoogleAuthConfigured(): boolean {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  return Boolean(clientId && clientSecret);
}

export function getGoogleOAuthCallbackUrl(req?: Request): string {
  // 1. Try resolving base URL dynamically from incoming request headers
  if (req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    if (host) {
      const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
      const proto = req.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");
      return `${proto}://${host}/api/auth/google/callback`;
    }
  }

  // 2. Fall back to NEXT_PUBLIC_APP_URL or localhost default
  const baseAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return `${baseAppUrl.replace(/\/+$/, "")}/api/auth/google/callback`;
}

export function generateGoogleOAuthUrl(state: string, req?: Request): string {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured.");
  }

  const callbackUrl = getGoogleOAuthCallbackUrl(req);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state: state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCodeForTokens(
  code: string,
  req?: Request
): Promise<GoogleOAuthTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  const callbackUrl = getGoogleOAuthCallbackUrl(req);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google token exchange failed:", response.status, errorText);
    throw new Error(`Failed to exchange authorization code: ${response.statusText}`);
  }

  const tokenData = await response.json();
  return tokenData as GoogleOAuthTokens;
}

export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch Google user profile:", response.status, errorText);
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  const profile = await response.json();
  return profile as GoogleProfile;
}

export function generateOAuthState(from: string = "/"): {
  stateParam: string;
  stateCookieValue: string;
} {
  const nonce = crypto.randomBytes(24).toString("hex");
  const payload = JSON.stringify({ nonce, from });
  const stateParam = Buffer.from(payload, "utf8").toString("base64url");
  return {
    stateParam,
    stateCookieValue: nonce,
  };
}

export function verifyOAuthState(
  stateParam: string | null,
  cookieNonce: string | undefined
): { isValid: boolean; from: string } {
  if (!stateParam || !cookieNonce) {
    return { isValid: false, from: "/" };
  }

  try {
    const decoded = Buffer.from(stateParam, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded);

    if (!parsed || typeof parsed !== "object") {
      return { isValid: false, from: "/" };
    }

    const { nonce, from } = parsed;
    if (!nonce || nonce !== cookieNonce) {
      return { isValid: false, from: "/" };
    }

    // Sanitize return path to prevent open redirect vulnerabilities
    const safeFrom = typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/";
    return { isValid: true, from: safeFrom };
  } catch {
    return { isValid: false, from: "/" };
  }
}
