import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getAdminJobListings,
  createJobListing,
  validateJobInput,
} from "@/lib/jobStorage";

export const dynamic = "force-dynamic";

// GET /api/admin/jobs - list jobs with filter
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined; // "ALL" | "ACTIVE" | "EXPIRED" | "DRAFT"

    const jobs = await getAdminJobListings({ search, status });

    return NextResponse.json({
      success: true,
      jobs,
      total: jobs.length,
    });
  } catch (err: any) {
    console.error("Failed to fetch admin job listings:", err);
    return NextResponse.json(
      { error: "Internal server error fetching job postings." },
      { status: 500 }
    );
  }
}

// POST /api/admin/jobs - create new job
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = validateJobInput(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const created = await createJobListing({
      companyName: body.companyName,
      companyLogo: body.companyLogo,
      role: body.role,
      jobType: body.jobType,
      batches: body.batches,
      qualifications: body.qualifications,
      experience: body.experience,
      location: body.location,
      description: body.description,
      applyUrl: body.applyUrl,
      deadline: body.deadline,
      isPublished: body.isPublished ?? true,
    });

    return NextResponse.json({
      success: true,
      job: created,
      message: "Job posting created successfully.",
    });
  } catch (err: any) {
    console.error("Failed to create job posting:", err);
    return NextResponse.json(
      { error: "Internal server error creating job posting." },
      { status: 500 }
    );
  }
}
