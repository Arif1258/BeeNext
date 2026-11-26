import React from "react";
import type { Metadata } from "next";
import CompanyPreparationClient from "@/components/CompanyPreparationClient";

export const metadata: Metadata = {
  title: "Company Preparation | BeeNext",
  description:
    "Curated company-specific interview preparation, technical tracks, and question patterns for TCS, Infosys, and top tech companies.",
};

export default function CompanyPreparationPage() {
  return <CompanyPreparationClient />;
}
