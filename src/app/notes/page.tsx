import React from "react";
import type { Metadata } from "next";
import NotesClient from "@/components/NotesClient";

export const metadata: Metadata = {
  title: "BeeNext DSA Sheet",
  description:
    "Comprehensive interview notes across 5 collections: DSA Topics, CS Fundamentals, Database Mastery, Programming Languages, and Advanced Development.",
};

export default function NotesPage() {
  return <NotesClient />;
}
