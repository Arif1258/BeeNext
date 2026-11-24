import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isUserActivePlus } from "@/lib/membership";
import { getPrivateCloudNote } from "@/lib/cloudStorage";
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

  // System Design
  "System_Design.pdf": "System_Design/System_Design.pdf",
};

/**
 * Resolves local file fallback when running locally or during transition
 */
function resolveLocalPdfFile(safeBaseName: string, registeredRelPath: string): string | null {
  const privateVaultRoots = [
    path.resolve(process.cwd(), "protected_notes"),
    path.resolve(process.cwd(), "BEENEXT_DSA_NOTES"),
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

    const safeBaseName = path.basename(requestedFile).trim();

    // 5. Strict Allowlist Verification: File must be registered in ALLOWED_NOTE_PDFS
    const registeredRelPath = ALLOWED_NOTE_PDFS[safeBaseName];
    if (!registeredRelPath) {
      return NextResponse.json(
        { error: "Requested note is not authorized or available." },
        { status: 404 }
      );
    }

    // Check for HTTP Range header
    const rangeHeader = req.headers.get("range");

    // Common security response headers
    const commonHeaders: Record<string, string> = {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeBaseName}"`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "default-src 'self'",
      "Accept-Ranges": "bytes",
    };

    // 6. Primary Storage: Secure Private Cloud Storage (Cloudflare R2 / AWS S3)
    const cloudNote = await getPrivateCloudNote(registeredRelPath, rangeHeader);
    if (cloudNote) {
      const responseHeaders = { ...commonHeaders };
      if (cloudNote.contentLength !== undefined) {
        responseHeaders["Content-Length"] = String(cloudNote.contentLength);
      }
      if (cloudNote.contentRange) {
        responseHeaders["Content-Range"] = cloudNote.contentRange;
      }

      return new Response(cloudNote.stream as any, {
        status: cloudNote.statusCode,
        headers: responseHeaders,
      });
    }

    // 7. Secondary / Development Fallback: Local Private Filesystem
    const localFilePath = resolveLocalPdfFile(safeBaseName, registeredRelPath);
    if (localFilePath && fs.existsSync(localFilePath)) {
      const stat = fs.statSync(localFilePath);
      const totalSize = stat.size;

      // Support Range request for local file streaming
      if (rangeHeader && rangeHeader.startsWith("bytes=")) {
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

        if (!isNaN(start) && start < totalSize) {
          const finalEnd = Math.min(end, totalSize - 1);
          const chunkSize = finalEnd - start + 1;
          const chunkBuffer = Buffer.alloc(chunkSize);
          const fd = fs.openSync(localFilePath, "r");
          try {
            fs.readSync(fd, chunkBuffer, 0, chunkSize, start);
          } finally {
            fs.closeSync(fd);
          }

          return new Response(chunkBuffer, {
            status: 206,
            headers: {
              ...commonHeaders,
              "Content-Range": `bytes ${start}-${finalEnd}/${totalSize}`,
              "Content-Length": String(chunkSize),
            },
          });
        }
      }

      // Full file response
      const fileBuffer = fs.readFileSync(localFilePath);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          ...commonHeaders,
          "Content-Length": String(totalSize),
        },
      });
    }

    // 8. File Not Found in either Cloud or Local Storage
    return NextResponse.json(
      { error: "Note document is currently being prepared." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Notes stream error:", error);
    return NextResponse.json(
      { error: "Failed to stream note document." },
      { status: 500 }
    );
  }
}
