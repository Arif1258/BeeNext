import { NextResponse } from "next/server";
import { getPublicJobListings } from "@/lib/jobStorage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const type = searchParams.get("type") || undefined;

    const listings = await getPublicJobListings({ search, type });

    // Sanitize response: do not expose raw applyUrl directly on public list
    // to enforce server-side login gate on application
    const sanitized = listings.map((job) => ({
      id: job.id,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      role: job.role,
      jobType: job.jobType,
      batches: job.batches,
      qualifications: job.qualifications,
      experience: job.experience,
      location: job.location,
      description: job.description,
      deadline: job.deadline,
      createdAt: job.createdAt,
    }));

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      jobs: sanitized,
    });
  } catch (err: any) {
    console.error("Failed to fetch public job listings:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve job opportunities." },
      { status: 500 }
    );
  }
}
