import React from "react";
import type { Metadata } from "next";
import JobAlertsClient from "@/components/JobAlertsClient";

export const metadata: Metadata = {
  title: "Job Alerts & Tech Careers | BeeNext",
  description:
    "Explore curated software engineering jobs, internships, and off-campus recruitment drives. Apply directly through official verified company portals.",
};

export default function JobAlertsPage() {
  return <JobAlertsClient />;
}
