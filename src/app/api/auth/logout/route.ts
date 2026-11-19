import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.delete(process.env.SESSION_COOKIE_NAME || "beenext_token");
  return response;
}
