import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getJobById } from "@/lib/jobStorage";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Enforce server-side authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please log in to apply for this job.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    // 2. Both Normal and Plus users are allowed without restriction
    const jobId = params.id;
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Invalid job identifier." },
        { status: 400 }
      );
    }

    const job = await getJobById(jobId);
    if (!job || !job.isPublished) {
      return NextResponse.json(
        { success: false, error: "This job listing is no longer available." },
        { status: 404 }
      );
    }

    // 3. Check expiration if deadline was explicitly configured
    if (job.deadline) {
      const deadlineMs = new Date(job.deadline).getTime();
      if (!isNaN(deadlineMs) && deadlineMs < Date.now()) {
        return NextResponse.json(
          { success: false, error: "The application deadline for this job has expired." },
          { status: 410 }
        );
      }
    }

    // 4. Return official application URL for client to redirect in a new tab
    return NextResponse.json({
      success: true,
      applyUrl: job.applyUrl,
      role: job.role,
      companyName: job.companyName,
    });
  } catch (err: any) {
    console.error("Apply job authorization failed:", err);
    return NextResponse.json(
      { success: false, error: "Unable to process job application request." },
      { status: 500 }
    );
  }
}
