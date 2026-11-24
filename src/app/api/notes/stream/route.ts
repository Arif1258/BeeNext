import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isUserActivePlus } from "@/lib/membership";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Strict allowlist mapping of all authorized BeeNext PDF notes to relative vault paths
const ALLOWED_NOTE_PDFS: Record<string, string> = {
  // Section 1: DSA Topic Notes
  "Sorting_Algorithms.pdf": "Sorting_Algorithms.pdf",
  "sorting-mastery.pdf": "Sorting_Algorithms.pdf",
  "Beginner_Problems.pdf": "Beginner_Problems.pdf",
  "Arrays.pdf": "Arrays.pdf",
  "strivers-a2z-dsa-notes.pdf": "Arrays.pdf",
  "Hashing.pdf": "Hashing.pdf",
  "Binary_Search.pdf": "Binary_Search.pdf",
  "Strings_Basic_and_Medium.pdf": "Strings_Basic_and_Medium.pdf",
  "Recursion.pdf": "Recursion.pdf",
  "Linked_List.pdf": "Linked_List.pdf",
  "Bit_Manipulation.pdf": "Bit_Manipulation.pdf",
  "Greedy_Algorithms.pdf": "Greedy_Algorithms.pdf",
  "Sliding_Window_Two_Pointer.pdf": "Sliding_Window_Two_Pointer.pdf",
  "Stack_and_Queues.pdf": "Stack_and_Queues.pdf",
  "Binary_Trees.pdf": "Binary_Trees.pdf",
  "Binary_Search_Trees.pdf": "Binary_Search_Trees.pdf",
  "Heaps.pdf": "Heaps.pdf",
  "Graphs.pdf": "Graphs.pdf",
  "Dynamic_Programming.pdf": "Dynamic_Programming.pdf",
  "dp-mastery.pdf": "Dynamic_Programming.pdf",
  "Tries.pdf": "Tries.pdf",
  "Strings_Advanced_Algorithms.pdf": "Strings_Advanced_Algorithms.pdf",
  "Maths.pdf": "Maths.pdf",

  // Section 2: CS Fundamentals
  "DBMS.pdf": "DBMS/DBMS.pdf",
  "Operating_Systems.pdf": "Operating_Systems/Operating_Systems.pdf",
  "Computer_Networks.pdf": "Computer_Networks/Computer_Networks.pdf",
  "OOPS.pdf": "OOPS/OOPS.pdf",

  // Section 3: Programming Languages
  "C_Programming.pdf": "C_Programming/C_Programming.pdf",
  "C++_Programming.pdf": "C++_Programming/C++_Programming.pdf",
  "Java_Programming.pdf": "Java_Programming/Java_Programming.pdf",
  "Python_Programming.pdf": "Python_Programming/Python_Programming.pdf",

  // Section 4: Frontend Development
  "HTML.pdf": "HTML/HTML.pdf",
  "CSS.pdf": "CSS/CSS.pdf",
  "JavaScript.pdf": "JavaScript/JavaScript.pdf",
  "React.pdf": "React/React.pdf",

  // Section 5: Backend Development
  "Node_js.pdf": "Node_js/Node_js.pdf",
  "Express_js.pdf": "Express_js/Express_js.pdf",
  "Spring_Boot.pdf": "Spring_Boot/Spring_Boot.pdf",

  // Section 6: Database
  "MySQL.pdf": "MySQL/MySQL.pdf",
  "MongoDB.pdf": "MongoDB/MongoDB.pdf",

  // Section 7: DevOps
  "Docker.pdf": "Docker/Docker.pdf",
  "Kubernetes.pdf": "Kubernetes/Kubernetes.pdf",

  // Section 8: Version Control
  "Git_and_GitHub.pdf": "Git_and_GitHub/Git_and_GitHub.pdf",
};

function resolvePrivatePdfFile(requestedFile: string): string | null {
  const safeBaseName = path.basename(requestedFile).trim();

  // 1. Strict Allowlist Verification: File must be registered in ALLOWED_NOTE_PDFS
  const registeredRelPath = ALLOWED_NOTE_PDFS[safeBaseName];
  if (!registeredRelPath) {
    return null;
  }

  // 2. Private Storage Vault Roots (strictly outside public directory)
  const privateVaultRoots = [
    path.resolve(process.cwd(), "BEENEXT_DSA_NOTES"),
    path.resolve(process.cwd(), "protected_notes"),
  ];

  for (const vaultRoot of privateVaultRoots) {
    if (!fs.existsSync(vaultRoot)) continue;

    // A. Check mapped relative subpath (e.g., DBMS/DBMS.pdf)
    const fullCandidatePath = path.resolve(vaultRoot, registeredRelPath);
    if (fullCandidatePath.startsWith(vaultRoot) && fs.existsSync(fullCandidatePath)) {
      try {
        if (fs.statSync(fullCandidatePath).isFile()) {
          return fullCandidatePath;
        }
      } catch {
        // continue
      }
    }

    // B. Check flat file inside vaultRoot
    const flatCandidatePath = path.resolve(vaultRoot, safeBaseName);
    if (flatCandidatePath.startsWith(vaultRoot) && fs.existsSync(flatCandidatePath)) {
      try {
        if (fs.statSync(flatCandidatePath).isFile()) {
          return flatCandidatePath;
        }
      } catch {
        // continue
      }
    }
  }

  return null;
}

export async function GET(req: Request) {
  try {
    // 1. Authentication Check: Unauthenticated requests receive 401
    const session = await getCurrentUser();
    if (!session || !session.id) {
      return NextResponse.json(
        { error: "Authentication required to access premium notes." },
        { status: 401 }
      );
    }

    // 2. Fresh User & Membership Verification from PostgreSQL Database
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        role: true,
        membershipType: true,
        membershipExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 401 }
      );
    }

    // 3. Authorization Check: Active Plus membership or Administrator required
    const isPlus = user.role === "ADMIN" || isUserActivePlus(user);
    if (!isPlus) {
      return NextResponse.json(
        {
          error: "Active BeeNext Plus membership is required to access premium notes.",
          code: "PLUS_REQUIRED",
        },
        { status: 403 }
      );
    }

    // 4. File Parameter Extraction & Validation
    const { searchParams } = new URL(req.url);
    const requestedFile = searchParams.get("file") || searchParams.get("noteId");

    if (!requestedFile) {
      return NextResponse.json(
        { error: "No note file specified." },
        { status: 400 }
      );
    }

    // 5. Secure File Resolution via Strict Allowlist & Private Storage
    const resolvedPath = resolvePrivatePdfFile(requestedFile);

    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      return NextResponse.json(
        { error: "Note document is currently being prepared." },
        { status: 404 }
      );
    }

    // 6. Read and Stream PDF Binary with Secure Headers
    const fileBuffer = fs.readFileSync(resolvedPath);
    const fileName = path.basename(resolvedPath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "default-src 'self'",
      },
    });
  } catch (error) {
    console.error("Notes stream error:", error);
    return NextResponse.json(
      { error: "Failed to stream note document." },
      { status: 500 }
    );
  }
}
