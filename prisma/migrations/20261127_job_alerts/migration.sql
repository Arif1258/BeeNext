-- Additive migration for Job Alerts feature
-- Safe, additive, idempotent DDL

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JobType') THEN
        CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'INTERNSHIP', 'OFF_CAMPUS');
    END IF;
END $$;

-- CreateTable JobListing
CREATE TABLE IF NOT EXISTS "job_listings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogo" TEXT,
    "role" TEXT NOT NULL,
    "jobType" "JobType" NOT NULL DEFAULT 'FULL_TIME',
    "batches" TEXT NOT NULL,
    "qualifications" TEXT,
    "experience" TEXT,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "applyUrl" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "job_listings_isPublished_idx" ON "job_listings"("isPublished");
CREATE INDEX IF NOT EXISTS "job_listings_jobType_idx" ON "job_listings"("jobType");
CREATE INDEX IF NOT EXISTS "job_listings_createdAt_idx" ON "job_listings"("createdAt");
