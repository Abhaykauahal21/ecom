import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { withRetry } from "@/lib/safe-db";
import EditReelForm from "./EditReelForm";

interface EditReelPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditReelPage({ params }: EditReelPageProps) {
  const { id } = await params;

  const reel = await withRetry(() =>
    prisma.instagramReel.findUnique({
      where: { id },
    })
  );

  if (!reel) {
    notFound();
  }

  // Serialize reel for the client component
  const serializedReel = JSON.parse(JSON.stringify(reel));

  return (
    <div className="container mx-auto px-4 py-8">
      <EditReelForm reel={serializedReel} />
    </div>
  );
}
