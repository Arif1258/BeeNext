import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface TopicWisePurchasePageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function TopicWisePurchasePage({
  searchParams,
}: TopicWisePurchasePageProps) {
  const topic = typeof searchParams?.topic === "string" ? searchParams.topic : undefined;
  if (topic) {
    redirect(`/purchase?topic=${encodeURIComponent(topic)}`);
  }
  redirect("/purchase#topics");
}
