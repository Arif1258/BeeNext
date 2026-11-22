import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        purchases: {
          where: { status: "COMPLETED" },
          select: {
            id: true,
            purchaseType: true,
            categoryId: true,
            problemId: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
        bookmarks: { select: { problemId: true } },
        progress: { select: { problemId: true, status: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
      purchases: user.purchases,
      bookmarks: user.bookmarks,
      progress: user.progress,
    };

    const response = NextResponse.json(
      { message: "Logged in successfully", user: userPayload },
      { status: 200 }
    );

    response.cookies.set({
      name: process.env.SESSION_COOKIE_NAME || "beenext_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error occurred during login" },
      { status: 500 }
    );
  }
}
