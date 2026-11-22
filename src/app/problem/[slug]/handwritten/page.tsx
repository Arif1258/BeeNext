import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface HandwrittenPageProps {
  params: {
    slug: string;
  };
}

export default function HandwrittenPage({ params }: HandwrittenPageProps) {
  // Individual problem handwritten notes removed; redirect to optimal solution
  redirect(`/problem/${params.slug}/optimal`);
}
