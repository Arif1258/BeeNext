import prisma from "@/lib/prisma";

export type JobType = "FULL_TIME" | "INTERNSHIP" | "OFF_CAMPUS";

export interface JobListingItem {
  id: string;
  companyName: string;
  companyLogo?: string | null;
  role: string;
  jobType: JobType;
  batches: string;
  qualifications?: string | null;
  experience?: string | null;
  location: string;
  description?: string | null;
  applyUrl: string;
  deadline?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Validates essential job inputs for posting and updates.
 * Requires: companyName, role, location, batches, applyUrl (valid http/https).
 */
export function validateJobInput(data: Partial<JobListingItem>): { valid: boolean; error?: string } {
  if (!data.companyName || typeof data.companyName !== "string" || !data.companyName.trim()) {
    return { valid: false, error: "Company name is required." };
  }
  if (!data.role || typeof data.role !== "string" || !data.role.trim()) {
    return { valid: false, error: "Job position is required." };
  }
  if (!data.location || typeof data.location !== "string" || !data.location.trim()) {
    return { valid: false, error: "Job location is required." };
  }
  if (!data.batches || typeof data.batches !== "string" || !data.batches.trim()) {
    return { valid: false, error: "Eligible batches are required (e.g. 2024, 2025, 2026)." };
  }
  if (!data.applyUrl || typeof data.applyUrl !== "string" || !data.applyUrl.trim()) {
    return { valid: false, error: "Official application URL is required." };
  }
  try {
    const url = new URL(data.applyUrl.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { valid: false, error: "Application URL must start with http:// or https://" };
    }
  } catch {
    return { valid: false, error: "Application URL must be a valid web address (e.g. https://...)" };
  }

  return { valid: true };
}

/**
 * Retrieves public active job listings directly from Neon PostgreSQL.
 * Jobs remain visible indefinitely until manually unpublished or deleted by an admin.
 */
export async function getPublicJobListings({
  search,
  type,
}: {
  search?: string;
  type?: string;
}): Promise<JobListingItem[]> {
  const whereClause: any = {
    isPublished: true,
  };

  if (type && type !== "ALL" && ["FULL_TIME", "INTERNSHIP", "OFF_CAMPUS"].includes(type)) {
    whereClause.jobType = type as any;
  }

  if (search && search.trim()) {
    const q = search.trim();
    whereClause.OR = [
      { companyName: { contains: q, mode: "insensitive" } },
      { role: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { batches: { contains: q, mode: "insensitive" } },
    ];
  }

  const records = await prisma.jobListing.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return records.map((r) => ({
    id: r.id,
    companyName: r.companyName,
    companyLogo: r.companyLogo,
    role: r.role,
    jobType: r.jobType as JobType,
    batches: r.batches,
    qualifications: r.qualifications,
    experience: r.experience,
    location: r.location,
    description: r.description,
    applyUrl: r.applyUrl,
    deadline: r.deadline ? r.deadline.toISOString() : null,
    isPublished: r.isPublished,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

/**
 * Retrieves all job listings for admin dashboard directly from Neon PostgreSQL.
 */
export async function getAdminJobListings({
  search,
  status,
}: {
  search?: string;
  status?: string;
}): Promise<JobListingItem[]> {
  const whereClause: any = {};

  if (status === "ACTIVE") {
    whereClause.isPublished = true;
  } else if (status === "DRAFT") {
    whereClause.isPublished = false;
  }

  if (search && search.trim()) {
    const q = search.trim();
    whereClause.OR = [
      { companyName: { contains: q, mode: "insensitive" } },
      { role: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { batches: { contains: q, mode: "insensitive" } },
    ];
  }

  const records = await prisma.jobListing.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return records.map((r) => ({
    id: r.id,
    companyName: r.companyName,
    companyLogo: r.companyLogo,
    role: r.role,
    jobType: r.jobType as JobType,
    batches: r.batches,
    qualifications: r.qualifications,
    experience: r.experience,
    location: r.location,
    description: r.description,
    applyUrl: r.applyUrl,
    deadline: r.deadline ? r.deadline.toISOString() : null,
    isPublished: r.isPublished,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

/**
 * Finds a specific job listing by id directly from Neon PostgreSQL.
 */
export async function getJobById(id: string): Promise<JobListingItem | null> {
  const r = await prisma.jobListing.findUnique({ where: { id } });
  if (!r) return null;

  return {
    id: r.id,
    companyName: r.companyName,
    companyLogo: r.companyLogo,
    role: r.role,
    jobType: r.jobType as JobType,
    batches: r.batches,
    qualifications: r.qualifications,
    experience: r.experience,
    location: r.location,
    description: r.description,
    applyUrl: r.applyUrl,
    deadline: r.deadline ? r.deadline.toISOString() : null,
    isPublished: r.isPublished,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/**
 * Creates a new job listing directly in Neon PostgreSQL.
 * Does NOT assign arbitrary expiration dates; deadline is null unless explicitly provided.
 */
export async function createJobListing(
  data: Omit<JobListingItem, "id" | "createdAt" | "updatedAt">
): Promise<JobListingItem> {
  const deadlineDate = data.deadline && !isNaN(new Date(data.deadline).getTime())
    ? new Date(data.deadline)
    : null;

  const sanitized = {
    companyName: data.companyName.trim(),
    companyLogo: data.companyLogo?.trim() || null,
    role: data.role.trim(),
    jobType: data.jobType || "FULL_TIME",
    batches: data.batches.trim(),
    qualifications: data.qualifications?.trim() || null,
    experience: data.experience?.trim() || null,
    location: data.location.trim(),
    description: data.description?.trim() || null,
    applyUrl: data.applyUrl.trim(),
    deadline: deadlineDate,
    isPublished: data.isPublished ?? true,
  };

  const r = await prisma.jobListing.create({
    data: sanitized,
  });

  return {
    id: r.id,
    companyName: r.companyName,
    companyLogo: r.companyLogo,
    role: r.role,
    jobType: r.jobType as JobType,
    batches: r.batches,
    qualifications: r.qualifications,
    experience: r.experience,
    location: r.location,
    description: r.description,
    applyUrl: r.applyUrl,
    deadline: r.deadline ? r.deadline.toISOString() : null,
    isPublished: r.isPublished,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/**
 * Updates an existing job listing directly in Neon PostgreSQL.
 */
export async function updateJobListing(
  id: string,
  data: Partial<Omit<JobListingItem, "id" | "createdAt" | "updatedAt">>
): Promise<JobListingItem | null> {
  const updatePayload: any = {};
  if (data.companyName !== undefined) updatePayload.companyName = data.companyName.trim();
  if (data.companyLogo !== undefined) updatePayload.companyLogo = data.companyLogo?.trim() || null;
  if (data.role !== undefined) updatePayload.role = data.role.trim();
  if (data.jobType !== undefined) updatePayload.jobType = data.jobType;
  if (data.batches !== undefined) updatePayload.batches = data.batches.trim();
  if (data.qualifications !== undefined) updatePayload.qualifications = data.qualifications?.trim() || null;
  if (data.experience !== undefined) updatePayload.experience = data.experience?.trim() || null;
  if (data.location !== undefined) updatePayload.location = data.location.trim();
  if (data.description !== undefined) updatePayload.description = data.description?.trim() || null;
  if (data.applyUrl !== undefined) updatePayload.applyUrl = data.applyUrl.trim();
  if (data.deadline !== undefined) {
    updatePayload.deadline = data.deadline && !isNaN(new Date(data.deadline).getTime())
      ? new Date(data.deadline)
      : null;
  }
  if (data.isPublished !== undefined) updatePayload.isPublished = data.isPublished;

  const r = await prisma.jobListing.update({
    where: { id },
    data: updatePayload,
  });

  return {
    id: r.id,
    companyName: r.companyName,
    companyLogo: r.companyLogo,
    role: r.role,
    jobType: r.jobType as JobType,
    batches: r.batches,
    qualifications: r.qualifications,
    experience: r.experience,
    location: r.location,
    description: r.description,
    applyUrl: r.applyUrl,
    deadline: r.deadline ? r.deadline.toISOString() : null,
    isPublished: r.isPublished,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/**
 * Deletes a job listing directly from Neon PostgreSQL.
 */
export async function deleteJobListing(id: string): Promise<boolean> {
  await prisma.jobListing.delete({ where: { id } });
  return true;
}
