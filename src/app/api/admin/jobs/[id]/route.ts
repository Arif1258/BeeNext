import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getJobById,
  updateJobListing,
  deleteJobListing,
  validateJobInput,
} from "@/lib/jobStorage";

export const dynamic = "force-dynamic";

// GET /api/admin/jobs/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const job = await getJobById(params.id);
    if (!job) {
      return NextResponse.json({ error: "Job posting not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    console.error("Failed to fetch job posting:", err);
    return NextResponse.json(
      { error: "Internal server error fetching job posting." },
      { status: 500 }
    );
  }
}

// PUT /api/admin/jobs/[id] - update job
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const updated = await updateJobListing(params.id, {
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
      isPublished: body.isPublished,
    });

    if (!updated) {
      return NextResponse.json({ error: "Job posting not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      job: updated,
      message: "Job posting updated successfully.",
    });
  } catch (err: any) {
    console.error("Failed to update job posting:", err);
    return NextResponse.json(
      { error: "Internal server error updating job posting." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/jobs/[id] - toggle published state
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (typeof body.isPublished !== "boolean") {
      return NextResponse.json(
        { error: "Field 'isPublished' must be a boolean." },
        { status: 400 }
      );
    }

    const updated = await updateJobListing(params.id, {
      isPublished: body.isPublished,
    });

    if (!updated) {
      return NextResponse.json({ error: "Job posting not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      job: updated,
      message: `Job posting ${body.isPublished ? "published" : "unpublished"} successfully.`,
    });
  } catch (err: any) {
    console.error("Failed to toggle publish status:", err);
    return NextResponse.json(
      { error: "Internal server error updating job status." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/jobs/[id] - delete job
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const deleted = await deleteJobListing(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Job posting not found or already deleted." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Job posting removed successfully.",
    });
  } catch (err: any) {
    console.error("Failed to delete job posting:", err);
    return NextResponse.json(
      { error: "Internal server error deleting job posting." },
      { status: 500 }
    );
  }
}
