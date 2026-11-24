import React from "react";
import type { Metadata } from "next";
import MembershipClient from "@/components/MembershipClient";

export const metadata: Metadata = {
  title: "BeeNext Plus Membership - Unlock Execution, Solutions & Notes",
  description:
    "Upgrade to BeeNext Plus for live code execution in Monaco editor, hidden test case submissions, complete Brute Force and Optimal solutions, and all 5 CS notes libraries.",
};

export default function MembershipPage() {
  return <MembershipClient />;
}
